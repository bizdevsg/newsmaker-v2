import React from "react";
import { Button } from "../atoms/Button";
import { Tag } from "../atoms/Tag";
import Link from "next/link";
import type { Locale, Messages } from "@/locales";
import {
  buildPortalNewsImageUrl,
  fetchPasarIndonesiaNews,
  sortPortalNewsItemsByDate,
} from "@/lib/portalnews";
import type { PortalNewsItem } from "@/lib/portalnews";
import { INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH } from "@/lib/indonesia-market-sections";
import { resolveIndonesiaMarketNewsCategorySlugFromItem } from "@/lib/indonesia-market-news-category";

type HeroSectionProps = {
  messages: Messages;
  locale: Locale;
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

async function getHeroArticle(locale: Locale, messages: Messages) {
  try {
    const { items } = await fetchPasarIndonesiaNews();

    const article = sortPortalNewsItemsByDate(items as PortalNewsItem[])[0];

    if (!article) return null;

    const articleSlug = article.slug?.trim();
    const categorySlug =
      resolveIndonesiaMarketNewsCategorySlugFromItem(article);
    const href = articleSlug
      ? `/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/${categorySlug}/${articleSlug}`
      : `/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/all`;

    return {
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
        article.kategori?.name?.trim() ||
        "MARKET"
      ).toUpperCase(),
      date: formatDate(article.updated_at ?? article.created_at, locale),
    };
  } catch {
    return null;
  }
}

export async function HeroSection({ messages, locale }: HeroSectionProps) {
  const heroArticle = await getHeroArticle(locale, messages);

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

      <Link
        href={
          heroArticle?.href ??
          `/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/all`
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
        <div className="relative flex min-h-55 flex-col gap-7 p-7 md:flex-row md:items-center">
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
    </section>
  );
}
