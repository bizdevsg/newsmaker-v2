import React from "react";
import { Button } from "../atoms/Button";
import { Tag } from "../atoms/Tag";
import Link from "next/link";
import type { Locale, Messages } from "@/locales";
import {
  buildPortalNewsImageUrl,
  fetchPortalNewsList,
} from "@/lib/portalnews";
import type { PortalNewsItem } from "@/lib/portalnews";
import {
  buildAnalysisDetailHref,
  buildAnalysisListHref,
  buildEconomicNewsDetailHref,
  buildEconomicNewsListHref,
  buildGoldCornerDetailHref,
  buildGoldCornerListHref,
  buildMarketAcademyDetailHref,
  buildMarketAcademyListHref,
  buildMarketNewsDetailHrefForItem,
  buildNewsCategoryHref,
  buildNewsSubHref,
  inferAnalysisCategoryFromItem,
  inferEconomicNewsCategoryFromItem,
  inferMarketNewsCategoryFromItem,
  normalizeEconomicNewsRouteSub,
  resolveAnalysisLabel,
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

  const resolvedLocale = locale === "en" ? "en-US" : "id-ID";
  const datePart = parsed.toLocaleDateString(resolvedLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const timePart = parsed
    .toLocaleTimeString(resolvedLocale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    })
    .replace(":", ".");

  return `${datePart} - ${timePart}`;
};

const getHeroPublishTimestamp = (article: PortalNewsItem) => {
  const value = article.created_at ?? article.updated_at;
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
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

const toHeroArticle = (
  article: PortalNewsItem,
  locale: Locale,
  messages: Messages,
  index: number,
): HeroArticle | null => {
  // Every category is eligible for the hero now - whichever article is
  // most recently published wins, Analisis & Opini / Market Analysis /
  // Gold Corner / Market Academy included.
  const slug = article.slug?.trim() || "";
  const marketKategori = inferMarketNewsCategoryFromItem(article);
  const analysisSlug = !marketKategori
    ? inferAnalysisCategoryFromItem(article)
    : null;
  const economicSub =
    !marketKategori && !analysisSlug
      ? inferEconomicNewsCategoryFromItem(article)
      : null;

  if (!marketKategori && !analysisSlug && !economicSub) return null;

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
    : analysisSlug
      ? analysisSlug === "gold-corner"
        ? slug
          ? buildGoldCornerDetailHref(locale, slug)
          : buildGoldCornerListHref(locale)
        : analysisSlug === "market-academy"
          ? slug
            ? buildMarketAcademyDetailHref(locale, slug)
            : buildMarketAcademyListHref(locale)
          : slug
            ? buildAnalysisDetailHref(locale, analysisSlug, slug)
            : buildAnalysisListHref(locale, analysisSlug)
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

  const tag = marketKategori
    ? (
        article.category_label?.trim() ||
        article.category?.trim() ||
        article.kategori?.name?.trim() ||
        messages.hero.bannerTag ||
        "MARKET"
      ).toUpperCase()
    : analysisSlug
      ? (
          article.category_label?.trim() ||
          article.category?.trim() ||
          article.main_category?.name?.trim() ||
          article.kategori?.name?.trim() ||
          resolveAnalysisLabel(messages, analysisSlug) ||
          "ANALYSIS"
        ).toUpperCase()
      : (
          article.sub_category?.name?.trim() ||
          article.main_category?.name?.trim() ||
          resolveEconomicNewsLabel(messages, economicSub!) ||
          "ECONOMIC"
        ).toUpperCase();

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
    tag,
    date: formatDate(article.created_at ?? article.updated_at, locale),
    href,
  };
};

async function getHeroArticles(locale: Locale, messages: Messages) {
  try {
    const { items } = await fetchPortalNewsList();
    const eligible = (items as PortalNewsItem[])
      .map((article, index) => {
        const heroArticle = toHeroArticle(article, locale, messages, index);
        if (!heroArticle) return null;

        return {
          heroArticle,
          publishedAt: getHeroPublishTimestamp(article),
        };
      })
      .filter(
        (
          value,
        ): value is { heroArticle: HeroArticle; publishedAt: number } =>
          value !== null,
      )
      .sort((left, right) => right.publishedAt - left.publishedAt)
      .map((value) => value.heroArticle);

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
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b2f63] via-[#0b2f63]/70 to-[#0b2f63]/20" />
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b2f63] via-[#0b2f63]/50 to-[#0b2f63]/20" />
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
