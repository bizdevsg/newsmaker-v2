import "server-only";

import type { Locale } from "@/locales";
import type { PortalNewsSearchResult } from "@/lib/portalnews-search";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import {
  type PortalNewsItem,
} from "@/lib/portalnews-shared";
import { buildPortalNewsImageUrl } from "@/lib/portalnews";
import {
  resolveRegulatoryWatchContent,
  resolveRegulatoryWatchImage,
  resolveRegulatoryWatchTag,
  resolveRegulatoryWatchTitle,
  type RegulatoryWatchItem,
} from "@/lib/regulatory-watch";
import { fetchRegulatoryWatchList } from "@/lib/regulatory-watch.server";
import {
  INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH,
  INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH,
} from "@/lib/indonesia-market-sections";

type Pagination = {
  has_more_pages?: boolean;
  next_page_url?: string | null;
};

type PortalPayload<T> = {
  status?: string;
  data?: T;
  meta?: {
    pagination?: Pagination;
  };
};

const MAX_PORTAL_PAGES = 25;

const DEFAULT_NEWS_URL =
  "http://portalnews.newsmaker.test/api/v1/newsmaker/pasar-indonesia/berita";
const DEFAULT_ANALYSIS_URL =
  "http://portalnews.newsmaker.test/api/v1/newsmaker/pasar-indonesia/analisis";

const NEWS_URL = (
  process.env.PORTALNEWS_PASAR_INDONESIA_URL ?? DEFAULT_NEWS_URL
).replace(/\/$/, "");
const ANALYSIS_URL = (
  process.env.PORTALNEWS_PASAR_INDONESIA_ANALYSIS_URL ?? DEFAULT_ANALYSIS_URL
).replace(/\/$/, "");

const TOKEN =
  process.env.PORTALNEWS_PASAR_INDONESIA_TOKEN ??
  "NPLD3SC2N06VVZYKUY5CRHJUQE3HSJ";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const cleanText = (value?: string | null) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const summarize = (value?: string | null) => {
  const text = cleanText(value);
  if (!text) return "";
  return text.length > 180 ? `${text.slice(0, 180).trim()}...` : text;
};

const getDateValue = (value?: string) => {
  const timestamp = Date.parse(value ?? "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const readNextPageUrl = (payload: unknown) => {
  if (!isRecord(payload)) return null;
  const meta = payload.meta;
  if (!isRecord(meta)) return null;
  const pagination = meta.pagination;
  if (!isRecord(pagination)) return null;

  const hasMore = pagination.has_more_pages;
  if (hasMore !== true) return null;

  const next = pagination.next_page_url;
  if (typeof next !== "string") return null;
  const normalized = next.trim();
  return normalized ? normalized : null;
};

const normalizePortalList = (payload: unknown): PortalNewsItem[] => {
  if (!isRecord(payload)) return [];
  if (payload.status !== "success") return [];
  const data = payload.data;
  return Array.isArray(data) ? (data as PortalNewsItem[]) : [];
};

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const resolvePortalTitle = (item: PortalNewsItem, locale: Locale) => {
  const titleId = normalizeText(item.title_id);
  const titleEn = normalizeText(item.title_en);
  const titleDefault =
    normalizeText(item.title) ||
    normalizeText(item.titles?.default) ||
    "";

  if (locale === "en") {
    return (
      titleEn ||
      normalizeText(item.titles?.en) ||
      titleId ||
      normalizeText(item.titles?.id) ||
      titleDefault ||
      "News Article"
    );
  }

  return (
    titleId ||
    normalizeText(item.titles?.id) ||
    titleEn ||
    normalizeText(item.titles?.en) ||
    titleDefault ||
    "Artikel"
  );
};

const resolvePortalContent = (item: PortalNewsItem, locale: Locale) => {
  const contentId = normalizeText(item.content_id);
  const contentEn = normalizeText(item.content_en);
  const contentDefault =
    normalizeText(item.content) ||
    normalizeText(item.contents?.default) ||
    "";

  if (locale === "en") {
    return (
      contentEn ||
      normalizeText(item.contents?.en) ||
      contentId ||
      normalizeText(item.contents?.id) ||
      contentDefault
    );
  }

  return (
    contentId ||
    normalizeText(item.contents?.id) ||
    contentEn ||
    normalizeText(item.contents?.en) ||
    contentDefault
  );
};

const fetchPortalPage = async (url: string): Promise<unknown | null> => {
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${TOKEN}`,
          "X-API-TOKEN": TOKEN,
        },
        next: { revalidate: 60 },
      },
      10_000,
    );

    if (!response.ok) return null;
    return (await response.json().catch(() => null)) as unknown;
  } catch {
    return null;
  }
};

const fetchPortalAll = async (baseUrl: string): Promise<PortalNewsItem[]> => {
  const items: PortalNewsItem[] = [];
  const seen = new Set<string>();

  let nextUrl: string | null = baseUrl;
  let pages = 0;

  while (nextUrl && pages < MAX_PORTAL_PAGES) {
    pages += 1;
    const payload = await fetchPortalPage(nextUrl);
    if (!payload) break;

    for (const item of normalizePortalList(payload)) {
      const slug = typeof item.slug === "string" ? item.slug.trim() : "";
      const key = slug || (item.id !== undefined ? String(item.id) : "");
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push(item);
    }

    nextUrl = readNextPageUrl(payload);
  }

  return items;
};

const scoreText = (
  normalizedQuery: string,
  queryTerms: string[],
  {
    title,
    category,
    content,
  }: { title: string; category: string; content: string },
) => {
  const normalizedTitle = cleanText(title);
  const normalizedContent = cleanText(content);
  const normalizedCategory = cleanText(category);

  let score = 0;

  if (normalizedTitle === normalizedQuery) score += 120;
  if (normalizedTitle.includes(normalizedQuery)) score += 50;
  if (normalizedCategory.includes(normalizedQuery)) score += 30;
  if (normalizedContent.includes(normalizedQuery)) score += 10;

  queryTerms.forEach((term) => {
    if (normalizedTitle.includes(term)) score += 8;
    if (normalizedCategory.includes(term)) score += 4;
    if (normalizedContent.includes(term)) score += 2;
  });

  return score;
};

const resolvePortalCategory = (item: PortalNewsItem, locale: Locale) => {
  const label =
    item.category_label?.trim() ||
    item.category?.trim() ||
    (item.type === "analisis"
      ? locale === "en"
        ? "Analysis"
        : "Analisis"
      : locale === "en"
        ? "News"
        : "Berita");
  return label;
};

const portalImage = (item: PortalNewsItem) =>
  buildPortalNewsImageUrl(item.image_url ?? item.image ?? item.images?.[0]);

const portalHref = (item: PortalNewsItem, locale: Locale) => {
  const slug = item.slug?.trim();
  if (!slug) return `/${locale}`;

  const isAnalysis = item.type === "analisis";
  const base = isAnalysis
    ? INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH
    : INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH;

  return `/${locale}/${base}/${encodeURIComponent(slug)}`;
};

const regulatoryHref = (item: RegulatoryWatchItem, locale: Locale) => {
  const slug = item.slug?.trim();
  if (!slug) return `/${locale}/regulasi-institusi`;
  return `/${locale}/regulasi-institusi/${encodeURIComponent(slug)}`;
};

export const searchPortalNews = async (
  query: string,
  locale: Locale,
): Promise<PortalNewsSearchResult[]> => {
  const normalizedQuery = cleanText(query);
  if (!normalizedQuery) return [];
  const queryTerms = normalizedQuery.split(" ").filter(Boolean);

  const [newsItems, analysisItems, regulatoryItems] = await Promise.all([
    fetchPortalAll(NEWS_URL),
    fetchPortalAll(ANALYSIS_URL),
    fetchRegulatoryWatchList(),
  ]);

  const portalItems: PortalNewsItem[] = [...newsItems, ...analysisItems];

  const portalResults: PortalNewsSearchResult[] = portalItems
    .map((item) => {
      const title = resolvePortalTitle(item, locale);
      const content = resolvePortalContent(item, locale);
      const category = resolvePortalCategory(item, locale);
      const score = scoreText(normalizedQuery, queryTerms, {
        title,
        category,
        content,
      });

      if (score <= 0) return null;

      const slug = item.slug?.trim() || "";
      return {
        type: item.type === "analisis" ? "analisis" : "berita",
        id: item.id ?? slug ?? `${category}-${title}`,
        title,
        summary: summarize(content),
        category,
        date: item.updated_at ?? item.created_at ?? "",
        image: portalImage(item),
        href: portalHref(item, locale),
        score,
      };
    })
    .filter((item): item is PortalNewsSearchResult => item !== null);

  const regulatoryResults: PortalNewsSearchResult[] = regulatoryItems
    .map((item, index) => {
      const title = resolveRegulatoryWatchTitle(item, locale);
      const content = resolveRegulatoryWatchContent(item, locale);
      const category = resolveRegulatoryWatchTag(item, locale);
      const score = scoreText(normalizedQuery, queryTerms, {
        title,
        category,
        content,
      });
      if (score <= 0) return null;

      const slug = item.slug?.trim() || "";
      return {
        type: "regulasi-institusi",
        id: item.id ?? slug ?? `regulasi-${index}`,
        title,
        summary: summarize(content),
        category,
        date: item.updated_at ?? item.created_at ?? "",
        image: resolveRegulatoryWatchImage(item),
        href: regulatoryHref(item, locale),
        score,
      };
    })
    .filter((item): item is PortalNewsSearchResult => item !== null);

  return [...portalResults, ...regulatoryResults].sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return getDateValue(right.date) - getDateValue(left.date);
  });
};
