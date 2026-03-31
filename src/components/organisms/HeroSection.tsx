import React from "react";
import { Button } from "../atoms/Button";
import { Tag } from "../atoms/Tag";
import type { Locale, Messages } from "@/locales";
import {
  buildPortalNewsImageUrl,
  fetchPortalNewsList,
  getPortalNewsCategoryKeys,
  normalizePortalNewsCategory,
  sortPortalNewsItemsByDate,
} from "@/lib/portalnews";
import type { PortalNewsItem } from "@/lib/portalnews";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";

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
  return text.length > 200 ? `${text.slice(0, 200).trim()}...` : text;
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

const isIndonesiaMarketItem = (messages: Messages, item: PortalNewsItem) => {
  const keys = getPortalNewsCategoryKeys(item);
  const accepted = new Set([
    "indonesia market",
    normalizePortalNewsCategory(messages.hero.title),
  ]);

  return keys.some((key) => accepted.has(key));
};

async function getHeroArticle(locale: Locale, messages: Messages) {
  try {
    const { items } = await fetchPortalNewsList();
    const article = sortPortalNewsItemsByDate(
      items.filter((item) => isIndonesiaMarketItem(messages, item)),
    )[0];

    if (!article) return null;

    const categorySlug = itemOrFallback(
      article.kategori?.slug,
      "indonesia-market",
    );
    const articleSlug = article.slug?.trim();
    const href = articleSlug
      ? `/${locale}/news/${categorySlug}/${articleSlug}`
      : `/${locale}/news/${categorySlug}`;

    return {
      title: resolvePortalNewsTitle(article, locale, messages.hero.bannerTitle),
      summary: toSummary(
        resolvePortalNewsContent(article, locale),
        messages.hero.bannerSubtitle,
      ),
      image:
        buildPortalNewsImageUrl(article.images?.[0]) ?? FALLBACK_HERO_IMAGE,
      href,
      tag:
        article.main_category?.name ??
        article.kategori?.name ??
        messages.hero.bannerTag,
      date: formatDate(article.updated_at ?? article.created_at, locale),
    };
  } catch {
    return null;
  }
}

const itemOrFallback = (value: string | undefined, fallback: string) => {
  const normalized = value?.trim();
  return normalized || fallback;
};

export async function HeroSection({ messages, locale }: HeroSectionProps) {
  const heroArticle = await getHeroArticle(locale, messages);

  return (
    <section className="space-y-6">
      <div className="mt-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl uppercase">
          {messages.hero.title}
        </h1>
        <p className="text-base text-slate-500">{messages.hero.subtitle}</p>
      </div>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 text-white shadow-lg">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroArticle?.image ?? FALLBACK_HERO_IMAGE}')`,
          }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#1061B3]  to-[#1061B3]/60" />
        <div className="relative flex min-h-55 flex-col gap-7 p-7 md:flex-row md:items-center">
          <div className="flex-1 space-y-5 max-w-xl">
            <Tag tone="slate" className="bg-white/15 text-white">
              {heroArticle?.tag ?? messages.hero.bannerTag}
            </Tag>
            {/* {heroArticle?.date ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                {heroArticle.date}
              </p>
            ) : null} */}
            <h2 className="text-3xl font-semibold">
              {heroArticle?.title ?? messages.hero.bannerTitle}
            </h2>
            <p className="text-base text-white/80">
              {heroArticle?.summary ?? messages.hero.bannerSubtitle}
            </p>
            <Button
              href={heroArticle?.href}
              variant="outline"
              size="sm"
              className="border-white/60 text-white"
            >
              {messages.hero.bannerCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
