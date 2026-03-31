import {
  buildPortalNewsImageUrl,
  fetchPortalNewsList,
  getPortalNewsCategoryName,
  getPortalNewsCategorySlug,
} from "@/lib/portalnews";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";
import type { Locale } from "@/locales";

const ECONOMIC_SLUGS = new Set([
  "economy",
  "fiscal-moneter",
  "fiscal-monetary",
  "global-economics",
]);

export type PortalNewsSearchResult = {
  category: string;
  date: string;
  href: string;
  id: number | string;
  image: string | null;
  score: number;
  summary: string;
  title: string;
};

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

export const normalizeSearchQuery = (value?: string | string[] | null) =>
  String(Array.isArray(value) ? value.join(" ") : value ?? "")
    .replace(/\s+/g, " ")
    .trim();

export const buildSearchPath = (locale: Locale, query?: string | null) => {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return `/${locale}/search`;

  return `/${locale}/search/${normalizedQuery
    .split(" ")
    .map(encodeURIComponent)
    .join("/")}`;
};

export const getSearchQueryFromSegments = (segments?: string[]) =>
  normalizeSearchQuery(segments?.join(" "));

export const searchPortalNews = async (
  query: string,
  locale: Locale,
): Promise<PortalNewsSearchResult[]> => {
  const normalizedQuery = cleanText(query);
  if (!normalizedQuery) return [];

  const queryTerms = normalizedQuery.split(" ").filter(Boolean);
  const { items } = await fetchPortalNewsList();

  return items
    .map((item) => {
      const title = resolvePortalNewsTitle(item, locale, "News Article");
      const content = resolvePortalNewsContent(item, locale, "");
      const categoryName = getPortalNewsCategoryName(
        item,
        getPortalNewsCategorySlug(item),
      );
      const normalizedTitle = cleanText(title);
      const normalizedContent = cleanText(content);
      const normalizedCategory = cleanText(categoryName);

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

      if (score <= 0) return null;

      const categorySlug = getPortalNewsCategorySlug(item, "market-update");
      const articleSlug = item.slug?.trim() || "";
      const isEconomic = ECONOMIC_SLUGS.has(categorySlug);
      const href = articleSlug
        ? `/${locale}/${isEconomic ? "economic-news" : "news"}/${categorySlug}/${articleSlug}`
        : `/${locale}/${isEconomic ? "economic-news" : "news"}`;

      return {
        id: item.id ?? articleSlug ?? `${categorySlug}-${title}`,
        title,
        summary: summarize(content),
        category: categoryName,
        date: item.updated_at ?? item.created_at ?? "",
        image: buildPortalNewsImageUrl(item.images?.[0]),
        href,
        score,
      };
    })
    .filter((item): item is PortalNewsSearchResult => item !== null)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return getDateValue(right.date) - getDateValue(left.date);
    });
};
