import type { Locale } from "@/locales";
import type { PortalNewsItem } from "@/lib/portalnews";
import { buildPortalNewsImageUrl, getPortalNewsItemTimestamp } from "@/lib/portalnews";
import type { NewsSubConfig } from "@/lib/news-routing";
import {
  buildAnalysisDetailHref,
  buildEconomicNewsDetailHref,
  buildMarketNewsDetailHrefForItem,
  buildNewsDetailHref,
  buildGoldCornerDetailHref,
  inferAnalysisCategoryFromItem,
  inferEconomicNewsCategoryFromItem,
} from "@/lib/news-routing";
import { itemMatchesTerms } from "@/lib/news-filter";

export type NewsCardItem = {
  key: string;
  title: string;
  summary: string;
  tag: string;
  date: string;
  image: string | null;
  href: string;
  timestamp: number;
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const resolveTitle = (item: PortalNewsItem, locale: Locale) => {
  if (locale === "en") {
    return (
      item.title_en?.trim() ||
      item.titles?.en?.trim() ||
      item.title?.trim() ||
      item.title_id?.trim() ||
      item.titles?.id?.trim() ||
      item.titles?.default?.trim() ||
      "News Article"
    );
  }

  return (
    item.title_id?.trim() ||
    item.titles?.id?.trim() ||
    item.title?.trim() ||
    item.title_en?.trim() ||
    item.titles?.en?.trim() ||
    item.titles?.default?.trim() ||
    "Artikel"
  );
};

const resolveSummary = (item: PortalNewsItem, locale: Locale) => {
  const content =
    locale === "en"
      ? item.content_en?.trim() ||
        item.contents?.en?.trim() ||
        item.content?.trim() ||
        item.content_id?.trim() ||
        item.contents?.id?.trim() ||
        item.contents?.default?.trim() ||
        ""
      : item.content_id?.trim() ||
        item.contents?.id?.trim() ||
        item.content?.trim() ||
        item.content_en?.trim() ||
        item.contents?.en?.trim() ||
        item.contents?.default?.trim() ||
        "";

  const text = stripHtml(content);
  if (!text) return "";
  return text.length > 160 ? `${text.slice(0, 160).trim()}...` : text;
};

const formatDateShort = (value: string | undefined, locale: Locale) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeAssetUrl = (value: string) => value.replace(/ /g, "%20");

export function toNewsCardItems(
  items: PortalNewsItem[],
  {
    locale,
    kategori,
    fixedSub,
    inferSubs,
    limit = 40,
  }: {
    locale: Locale;
    kategori: string;
    fixedSub?: string | null;
    inferSubs?: NewsSubConfig[] | null;
    limit?: number;
  },
): NewsCardItem[] {
  const resolved = items
    .map((item, index) => {
      const slug = item.slug?.trim() || "";
      if (!slug) return null;

      const apiSubSlug =
        typeof item.sub_category?.slug === "string" && item.sub_category.slug
          ? item.sub_category.slug
          : null;

      const inferredSub =
        kategori === "crypto"
          ? null
          : fixedSub ??
            apiSubSlug ??
            (inferSubs?.length
              ? inferSubs.find((sub) => itemMatchesTerms(item, sub.matchTerms))
                  ?.slug ?? inferSubs[0]?.slug
              : null);

      const href = buildNewsDetailHref(locale, kategori, slug, inferredSub);
      const tag =
        item.category_label?.trim() ||
        item.category?.trim() ||
        item.kategori?.name?.trim() ||
        (locale === "en" ? "News" : "Berita");

      const image =
        buildPortalNewsImageUrl(item.image_url || item.image || item.images?.[0]) ??
        null;

      const timestamp = getPortalNewsItemTimestamp(item);

      return {
        key: String(item.id ?? slug ?? `news-${index}`),
        title: resolveTitle(item, locale),
        summary: resolveSummary(item, locale),
        tag,
        date: formatDateShort(item.updated_at ?? item.created_at, locale),
        image: image ? normalizeAssetUrl(image) : null,
        href,
        timestamp,
      } satisfies NewsCardItem;
    })
    .filter((value): value is NewsCardItem => value !== null)
    .sort((a, b) => b.timestamp - a.timestamp);

  return resolved.slice(0, limit);
}

export function toMarketNewsCardItemsAuto(
  items: PortalNewsItem[],
  {
    locale,
    limit = 6,
  }: {
    locale: Locale;
    limit?: number;
  },
): NewsCardItem[] {
  const resolved = items
    .map((item, index) => {
      const href = buildMarketNewsDetailHrefForItem(locale, item);
      if (!href) return null;

      const slug = item.slug?.trim() || "";
      if (!slug) return null;

      const tag =
        item.sub_category?.name?.trim() ||
        item.main_category?.name?.trim() ||
        item.category_label?.trim() ||
        item.category?.trim() ||
        item.kategori?.name?.trim() ||
        (locale === "en" ? "News" : "Berita");

      const image =
        buildPortalNewsImageUrl(item.image_url || item.image || item.images?.[0]) ??
        null;

      const timestamp = getPortalNewsItemTimestamp(item);

      return {
        key: String(item.id ?? slug ?? `news-${index}`),
        title: resolveTitle(item, locale),
        summary: resolveSummary(item, locale),
        tag,
        date: formatDateShort(item.updated_at ?? item.created_at, locale),
        image: image ? normalizeAssetUrl(image) : null,
        href,
        timestamp,
      } satisfies NewsCardItem;
    })
    .filter((value): value is NewsCardItem => value !== null)
    .sort((a, b) => b.timestamp - a.timestamp);

  return resolved.slice(0, limit);
}

function toSimpleCardItems(
  items: PortalNewsItem[],
  {
    locale,
    hrefForSlug,
    limit = 40,
  }: {
    locale: Locale;
    hrefForSlug: (slug: string) => string;
    limit?: number;
  },
): NewsCardItem[] {
  const resolved = items
    .map((item, index) => {
      const slug = item.slug?.trim() || "";
      if (!slug) return null;

      const href = hrefForSlug(slug);
      const tag =
        item.category_label?.trim() ||
        item.category?.trim() ||
        item.kategori?.name?.trim() ||
        (locale === "en" ? "News" : "Berita");

      const image =
        buildPortalNewsImageUrl(item.image_url || item.image || item.images?.[0]) ??
        null;

      const timestamp = getPortalNewsItemTimestamp(item);

      return {
        key: String(item.id ?? slug ?? `news-${index}`),
        title: resolveTitle(item, locale),
        summary: resolveSummary(item, locale),
        tag,
        date: formatDateShort(item.updated_at ?? item.created_at, locale),
        image: image ? normalizeAssetUrl(image) : null,
        href,
        timestamp,
      } satisfies NewsCardItem;
    })
    .filter((value): value is NewsCardItem => value !== null)
    .sort((a, b) => b.timestamp - a.timestamp);

  return resolved.slice(0, limit);
}

export function toEconomicNewsCardItems(
  items: PortalNewsItem[],
  {
    locale,
    sub,
    limit = 40,
  }: {
    locale: Locale;
    sub: string;
    limit?: number;
  },
): NewsCardItem[] {
  return toSimpleCardItems(items, {
    locale,
    limit,
    hrefForSlug: (slug) => buildEconomicNewsDetailHref(locale, sub, slug),
  });
}

export function toEconomicNewsCardItemsAuto(
  items: PortalNewsItem[],
  {
    locale,
    limit = 80,
  }: {
    locale: Locale;
    limit?: number;
  },
): NewsCardItem[] {
  const resolved = items
    .map((item, index) => {
      const slug = item.slug?.trim() || "";
      if (!slug) return null;

      const inferredSub = inferEconomicNewsCategoryFromItem(item);
      if (!inferredSub) return null;

      const href = buildEconomicNewsDetailHref(locale, inferredSub, slug);
      const tag =
        item.category_label?.trim() ||
        item.category?.trim() ||
        item.kategori?.name?.trim() ||
        (locale === "en" ? "Economic News" : "Berita Ekonomi");

      const image =
        buildPortalNewsImageUrl(item.image_url || item.image || item.images?.[0]) ??
        null;

      const timestamp = getPortalNewsItemTimestamp(item);

      return {
        key: String(item.id ?? slug ?? `economic-${index}`),
        title: resolveTitle(item, locale),
        summary: resolveSummary(item, locale),
        tag,
        date: formatDateShort(item.updated_at ?? item.created_at, locale),
        image: image ? normalizeAssetUrl(image) : null,
        href,
        timestamp,
      } satisfies NewsCardItem;
    })
    .filter((value): value is NewsCardItem => value !== null)
    .sort((a, b) => b.timestamp - a.timestamp);

  return resolved.slice(0, limit);
}

export function toAnalysisCardItems(
  items: PortalNewsItem[],
  {
    locale,
    sub,
    limit = 40,
  }: {
    locale: Locale;
    sub: string;
    limit?: number;
  },
): NewsCardItem[] {
  return toSimpleCardItems(items, {
    locale,
    limit,
    hrefForSlug: (slug) => buildAnalysisDetailHref(locale, sub, slug),
  });
}

export function toAnalysisCardItemsAuto(
  items: PortalNewsItem[],
  {
    locale,
    limit = 80,
  }: {
    locale: Locale;
    limit?: number;
  },
): NewsCardItem[] {
  const resolved = items
    .map((item, index) => {
      const slug = item.slug?.trim() || "";
      if (!slug) return null;

      const inferredSub = inferAnalysisCategoryFromItem(item);
      if (!inferredSub) return null;

      const href = buildAnalysisDetailHref(locale, inferredSub, slug);
      const tag =
        item.category_label?.trim() ||
        item.category?.trim() ||
        item.kategori?.name?.trim() ||
        (locale === "en" ? "Analysis" : "Analisis");

      const image =
        buildPortalNewsImageUrl(item.image_url || item.image || item.images?.[0]) ??
        null;

      const timestamp = getPortalNewsItemTimestamp(item);

      return {
        key: String(item.id ?? slug ?? `analysis-${index}`),
        title: resolveTitle(item, locale),
        summary: resolveSummary(item, locale),
        tag,
        date: formatDateShort(item.updated_at ?? item.created_at, locale),
        image: image ? normalizeAssetUrl(image) : null,
        href,
        timestamp,
      } satisfies NewsCardItem;
    })
    .filter((value): value is NewsCardItem => value !== null)
    .sort((a, b) => b.timestamp - a.timestamp);

  return resolved.slice(0, limit);
}

export function toGoldCornerCardItems(
  items: PortalNewsItem[],
  {
    locale,
    limit = 40,
  }: {
    locale: Locale;
    limit?: number;
  },
): NewsCardItem[] {
  return toSimpleCardItems(items, {
    locale,
    limit,
    hrefForSlug: (slug) => buildGoldCornerDetailHref(locale, slug),
  });
}
