import React from "react";
import { Button } from "../atoms/Button";
import { Tag } from "../atoms/Tag";
import Link from "next/link";
import type { Locale, Messages } from "@/locales";
import { itemMatchesTerms } from "@/lib/news-filter";
import {
  buildPortalNewsImageUrl,
  fetchPortalNewsList,
  sortPortalNewsItemsByDate,
} from "@/lib/portalnews";
import type { PortalNewsItem } from "@/lib/portalnews";
import {
  ANALYSIS_CONFIG,
  buildEconomicNewsDetailHref,
  buildEconomicNewsListHref,
  buildMarketNewsDetailHrefForItem,
  buildNewsCategoryHref,
  buildNewsSubHref,
  inferEconomicNewsCategoryFromItem,
  inferMarketNewsCategoryFromItem,
  normalizeEconomicNewsRouteSub,
  resolveEconomicNewsLabel,
} from "@/lib/news-routing";

type HeroSectionProps = {
  messages: Messages;
  locale: Locale;
};

const FALLBACK_HERO_IMAGE =
  "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp";

type HeroArticle = {
  key: string;
  title: string;
  summary: string;
  image: string;
  tag: string;
  date: string;
  href: string;
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const toSummary = (value?: string | null, fallback?: string) => {
  const text = stripHtml(value ?? "");
  if (!text) return fallback ?? "";
  return text;
};

const formatDate = (value: string | undefined, locale: Locale) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const normalizeAssetUrl = (value: string) => value.replace(/ /g, "%20");

const resolvePortalNewsTitle = (
  article: PortalNewsItem | null | undefined,
  locale: Locale,
  fallback: string,
) => {
  if (!article) return fallback;

  if (locale === "en") {
    return (
      article.title_en?.trim() ||
      article.title?.trim() ||
      article.title_id?.trim() ||
      fallback
    );
  }

  return (
    article.title_id?.trim() ||
    article.title?.trim() ||
    article.title_en?.trim() ||
    fallback
  );
};

const resolvePortalNewsContent = (
  article: PortalNewsItem | null | undefined,
  locale: Locale,
) => {
  if (!article) return "";

  if (locale === "en") {
    return (
      article.content_en?.trim() ||
      article.content?.trim() ||
      article.content_id?.trim() ||
      ""
    );
  }

  return (
    article.content_id?.trim() ||
    article.content?.trim() ||
    article.content_en?.trim() ||
    ""
  );
};

const normalizeSlug = (value?: string | null) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[-_]+/g, "-")
    .trim();

const isAnalysisItem = (article: PortalNewsItem) => {
  const type = article.type?.trim().toLowerCase() ?? "";
  if (type === "analisis" || type === "analysis" || type === "gold-corner")
    return true;

  const categorySlugs = [
    article.sub_category?.slug,
    article.main_category?.slug,
    article.kategori?.slug,
  ]
    .map((value) => normalizeSlug(value))
    .filter(Boolean);

  if (categorySlugs.includes("market-analysis")) return true;
  if (categorySlugs.includes("analisis-opinion")) return true;
  if (categorySlugs.includes("gold-corner")) return true;

  return ANALYSIS_CONFIG.some((config) =>
    itemMatchesTerms(article, config.matchTerms),
  );
};

const toHeroArticle = (
  article: PortalNewsItem,
  locale: Locale,
  messages: Messages,
  index: number,
): HeroArticle | null => {
  if (isAnalysisItem(article)) return null;

  const slug = article.slug?.trim() || "";
  const marketKategori = inferMarketNewsCategoryFromItem(article);
  const economicSub = !marketKategori
    ? inferEconomicNewsCategoryFromItem(article)
    : null;

  if (!marketKategori && !economicSub) return null;

  const sub =
    article.sub_category?.slug?.trim() ||
    article.main_category?.slug?.trim() ||
    article.kategori?.slug?.trim() ||
    "";

  const href = marketKategori
    ? (buildMarketNewsDetailHrefForItem(locale, article) ??
      (sub
        ? buildNewsSubHref(locale, marketKategori, sub)
        : buildNewsCategoryHref(locale, marketKategori)))
    : slug
      ? buildEconomicNewsDetailHref(
          locale,
          normalizeEconomicNewsRouteSub(economicSub!),
          slug,
        )
      : buildEconomicNewsListHref(
          locale,
          normalizeEconomicNewsRouteSub(economicSub!),
        );

  return {
    key: String(article.id ?? slug ?? `hero-${index}`),
    title: resolvePortalNewsTitle(article, locale, messages.hero.bannerTitle),
    summary: toSummary(
      resolvePortalNewsContent(article, locale),
      messages.hero.bannerSubtitle,
    ),
    image: normalizeAssetUrl(
      buildPortalNewsImageUrl(
        article.image_url || article.image || article.images?.[0],
      ) ?? FALLBACK_HERO_IMAGE,
    ),
    tag: marketKategori
      ? (
          article.category_label?.trim() ||
          article.category?.trim() ||
          article.kategori?.name?.trim() ||
          messages.hero.bannerTag ||
          "MARKET"
        ).toUpperCase()
      : (
          article.sub_category?.name?.trim() ||
          article.main_category?.name?.trim() ||
          resolveEconomicNewsLabel(messages, economicSub!) ||
          "ECONOMIC"
        ).toUpperCase(),
    date: formatDate(article.updated_at ?? article.created_at, locale),
    href,
  };
};

async function getHeroArticles(locale: Locale, messages: Messages) {
  try {
    const { items } = await fetchPortalNewsList();
    const sorted = sortPortalNewsItemsByDate(items as PortalNewsItem[]);

    const eligible = sorted
      .map((article, index) => toHeroArticle(article, locale, messages, index))
      .filter((value): value is HeroArticle => value !== null);

    if (!eligible.length) return null;

    const featured = eligible[0];
    const secondary = eligible.slice(1, 4);

    return { featured, secondary };
  } catch {
    return null;
  }
}

export async function HeroSection({ messages, locale }: HeroSectionProps) {
  const heroArticles = await getHeroArticles(locale, messages);
  const readMoreLabel = locale === "en" ? "Read More" : "Read More";

  const fallbackFeatured: HeroArticle = {
    key: "hero-featured-fallback",
    title: messages.hero.bannerTitle,
    summary: messages.hero.bannerSubtitle,
    image: normalizeAssetUrl(FALLBACK_HERO_IMAGE),
    tag: (messages.hero.bannerTag || "MARKET").toUpperCase(),
    date: "",
    href: `/${locale}/news`,
  };

  const featured = heroArticles?.featured ?? fallbackFeatured;
  const secondary = heroArticles?.secondary ?? [];

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Link
          href={featured.href}
          className="group relative block overflow-hidden rounded-xl border border-slate-200 text-white shadow-lg no-underline"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url('${featured.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b2f63] via-[#0b2f63]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="relative flex min-h-[310px] h-full flex-col justify-between gap-4 p-7 sm:min-h-[340px]">
            <div className="space-y-3">
              <Tag tone="slate" className="bg-white/15 text-white uppercase">
                MARKET DEVELOPMENT
              </Tag>
              <h2 className="max-w-2xl text-2xl font-semibold leading-snug sm:text-3xl">
                {featured.title}
              </h2>
              {featured.date ? (
                <p className="text-sm font-semibold text-white/80">
                  {featured.date}
                </p>
              ) : null}
            </div>

            <Button
              as="span"
              variant="outline"
              size="sm"
              className="border-white/60 bg-white text-slate-900 hover:bg-white/95 w-fit"
            >
              {messages.hero.bannerCta}
            </Button>
          </div>
        </Link>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {secondary.slice(0, 2).map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="group relative block overflow-hidden rounded-xl border border-slate-200 text-white shadow-lg no-underline"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url('${item.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b2f63] via-[#0b2f63]/35 to-transparent" />
                <div className="relative flex min-h-[160px] flex-col justify-between gap-4 p-4">
                  <div className="space-y-2">
                    <div className="bg-blue-500/50 w-fit rounded-full px-3 py-0.5">
                      <p className="text-[11px] font-bold tracking-wide text-white/90">
                        {item.tag}
                      </p>
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    {item.date ? (
                      <p className="text-xs font-semibold text-white/80">
                        {item.date}
                      </p>
                    ) : null}

                    <Button
                      as="span"
                      variant="outline"
                      size="sm"
                      className="border-white/60 bg-white text-slate-900 hover:bg-white/95 w-fit"
                    >
                      {readMoreLabel}
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {secondary[2] ? (
            <Link
              key={secondary[2].key}
              href={secondary[2].href}
              className="group relative block overflow-hidden rounded-xl border border-slate-200 text-white shadow-lg no-underline"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url('${secondary[2].image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b2f63] via-[#0b2f63]/40 to-transparent" />
              <div className="relative flex min-h-[170px] flex-col justify-between gap-4 p-5">
                <div className="space-y-2">
                  <div className="bg-blue-500/50 w-fit rounded-full px-3 py-0.5">
                    <p className="text-[11px] font-bold tracking-wide text-white/90">
                      {secondary[2].tag}
                    </p>
                  </div>
                  <p className="line-clamp-2 text-base font-semibold leading-snug">
                    {secondary[2].title}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  {secondary[2].date ? (
                    <p className="text-xs font-semibold text-white/80">
                      {secondary[2].date}
                    </p>
                  ) : null}

                  <Button
                    as="span"
                    variant="outline"
                    size="sm"
                    className="border-white/60 bg-white text-slate-900 hover:bg-white/95 w-fit"
                  >
                    {readMoreLabel}
                  </Button>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
