import React from "react";
import { Button } from "../atoms/Button";
import { Tag } from "../atoms/Tag";
import Link from "next/link";
import type { Locale, Messages } from "@/locales";
import {
  buildPortalNewsImageUrl,
  fetchPasarIndonesiaNews,
  fetchHeroSectionNews,
  sortPortalNewsItemsByDate,
} from "@/lib/portalnews";
import type { PortalNewsItem } from "@/lib/portalnews";
import {
  filterHeroSectionNews,
  resolveHeroSectionTopic,
  resolveHeroSectionTopicLabel,
} from "@/lib/news-filter";
import { INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH } from "@/lib/indonesia-market-sections";
import { resolveIndonesiaMarketNewsCategorySlugFromItem } from "@/lib/indonesia-market-news-category";

type HeroSectionProps = {
  messages: Messages;
  locale: Locale;
};

type HeroArticle = {
  key: string;
  title: string;
  summary: string;
  image: string;
  href: string;
  tag: string;
  date: string;
};

const FALLBACK_HERO_IMAGE =
  "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp";

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

const mapPortalNewsToHeroArticle = (
  article: PortalNewsItem,
  locale: Locale,
  messages: Messages,
): HeroArticle => {
  const articleSlug = article.slug?.trim();
  const categorySlug = resolveIndonesiaMarketNewsCategorySlugFromItem(article);
  const resolvedTopicLabel = resolveHeroSectionTopicLabel(article);
  const href = articleSlug
    ? `/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/${categorySlug}/${articleSlug}`
    : `/${locale}`;

  return {
    key: `${article.id ?? article.slug ?? href}`,
    title: resolvePortalNewsTitle(article, locale, messages.hero.bannerTitle),
    summary: toSummary(
      resolvePortalNewsContent(article, locale),
      messages.hero.bannerSubtitle,
    ),
    image:
      buildPortalNewsImageUrl(
        article.image_url || article.image || article.images?.[0],
      ) ?? FALLBACK_HERO_IMAGE,
    href,
    tag: (
      article.category_label?.trim() ||
      article.category?.trim() ||
      resolvedTopicLabel ||
      article.kategori?.name?.trim() ||
      article.sub_category?.name?.trim() ||
      article.main_category?.name?.trim() ||
      "MARKET"
    ).toUpperCase(),
    date: formatDate(article.updated_at ?? article.created_at, locale),
  };
};

const mergeUniqueHeroItems = (...collections: PortalNewsItem[][]) => {
  const seen = new Set<string>();

  return collections.flatMap((items) =>
    items.filter((item) => {
      const key = item.slug?.trim() || String(item.id ?? "").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  );
};

async function getHeroArticles(locale: Locale, messages: Messages) {
  try {
    const results = await Promise.allSettled([
      fetchHeroSectionNews(),
      fetchPasarIndonesiaNews(),
    ]);
    const heroSectionItems =
      results[0].status === "fulfilled" ? results[0].value.items : [];
    const pasarIndonesiaItems =
      results[1].status === "fulfilled" ? results[1].value.items : [];
    const mergedItems = mergeUniqueHeroItems(
      heroSectionItems,
      pasarIndonesiaItems,
    );
    const filteredItems = filterHeroSectionNews(mergedItems);
    const sorted = sortPortalNewsItemsByDate(filteredItems);
    const seenTopics = new Set<string>();
    const prioritized = sorted.filter((item) => {
      const topic = resolveHeroSectionTopic(item);
      if (!topic) return false;
      if (seenTopics.has(topic)) return false;
      seenTopics.add(topic);
      return true;
    });
    const selectedItems = mergeUniqueHeroItems(prioritized, sorted).slice(0, 4);

    const heroItem = selectedItems[0];
    const sideItems = selectedItems.slice(1, 4);

    return {
      hero: heroItem ? mapPortalNewsToHeroArticle(heroItem, locale, messages) : null,
      side: sideItems.map((item) => mapPortalNewsToHeroArticle(item, locale, messages)),
    };
  } catch {
    return { hero: null, side: [] as HeroArticle[] };
  }
}

export async function HeroSection({ messages, locale }: HeroSectionProps) {
  const { hero: heroArticle, side: sideArticles } = await getHeroArticles(
    locale,
    messages,
  );
  const secondary = sideArticles;
  const readMoreLabel = messages.common.readFull;

  return (
    <section className="space-y-6">
      <div className="mt-3">
        {/* <h1 className="text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl uppercase">
          {messages.hero.title}
        </h1> */}
        <p className="text-base md:text-lg text-center text-blue-900 font-bold font-serif">
          Market & Economic Intelligence Platform Insight on Macro, Commodities,
          Equities & Policy
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
        <Link
          href={
            heroArticle?.href ?? `/${locale}`
          }
          className="block relative group overflow-hidden rounded-xl border border-slate-200 text-white shadow-lg no-underline"
        >
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
            style={{
              backgroundImage: `url('${heroArticle?.image ?? FALLBACK_HERO_IMAGE}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1061B3] to-[#1061B3]/60" />
          <div className="relative flex min-h-[13.75rem] flex-col gap-7 p-7 md:flex-row md:items-center">
            <div className="flex-1 space-y-5 max-w-xl">
              <Tag tone="slate" className="bg-white/15 text-white">
                {heroArticle?.tag ?? messages.hero.bannerTag}
              </Tag>

              <h2 className="text-3xl font-semibold">
                {heroArticle?.title ?? messages.hero.bannerTitle}
              </h2>

              <p className="text-base text-white/80 line-clamp-4">
                {heroArticle?.summary ?? messages.hero.bannerSubtitle}
              </p>

              <Button
                as="span"
                variant="outline"
                size="sm"
                className="border-white/60 text-white"
              >
                {messages.hero.bannerCta}
              </Button>
            </div>
          </div>
        </Link>

        {secondary.length > 0 ? (
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
                      <div className="w-fit rounded-full bg-blue-500/50 px-3 py-0.5">
                        <p className="text-[11px] font-bold tracking-wide text-white/90">
                          {item.tag}
                        </p>
                      </div>
                      <p className="line-clamp-2 text-sm font-semibold leading-snug">
                        {item.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      {item.date ? (
                        <p className="text-xs font-semibold text-white/80">
                          {item.date}
                        </p>
                      ) : (
                        <span />
                      )}

                      <Button
                        as="span"
                        variant="outline"
                        size="sm"
                        className="w-fit border-white/60 bg-white text-slate-900 hover:bg-white/95"
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
                    <div className="w-fit rounded-full bg-blue-500/50 px-3 py-0.5">
                      <p className="text-[11px] font-bold tracking-wide text-white/90">
                        {secondary[2].tag}
                      </p>
                    </div>
                    <p className="line-clamp-2 text-base font-semibold leading-snug">
                      {secondary[2].title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {secondary[2].date ? (
                      <p className="text-xs font-semibold text-white/80">
                        {secondary[2].date}
                      </p>
                    ) : (
                      <span />
                    )}

                    <Button
                      as="span"
                      variant="outline"
                      size="sm"
                      className="w-fit border-white/60 bg-white text-slate-900 hover:bg-white/95"
                    >
                      {readMoreLabel}
                    </Button>
                  </div>
                </div>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
