import type { Metadata } from "next";
import { INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH } from "@/lib/indonesia-market-sections";
import type { Locale } from "@/locales";
import { resolveIndonesiaMarketNewsCategorySlugFromItem } from "@/lib/indonesia-market-news-category";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const SECTION_LABEL = "Pasar Indonesia";

const DEFAULT_NEWS_URL =
  "http://portalnews.newsmaker.test/api/v1/newsmaker/pasar-indonesia/berita";
const API_URL = process.env.PORTALNEWS_PASAR_INDONESIA_URL ?? DEFAULT_NEWS_URL;
const API_TOKEN =
  process.env.PORTALNEWS_PASAR_INDONESIA_TOKEN ??
  "NPLD3SC2N06VVZYKUY5CRHJUQE3HSJ";
const PORTAL_BASE_URL = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return "http://portalnews.newsmaker.test";
  }
})();

type ApiAuthor = {
  id?: number;
  name?: string;
  email?: string;
};

export type IndonesiaMarketNewsItem = {
  id?: number;
  type?: string;
  slug?: string;
  image?: string;
  image_url?: string;
  title_id?: string;
  title_en?: string;
  content_id?: string;
  content_en?: string;
  category?: string;
  category_label?: string;
  source?: string;
  author?: ApiAuthor;
  created_at?: string;
  updated_at?: string;
};

type ApiNewsResponse = {
  status?: string;
  type?: string;
  data?: IndonesiaMarketNewsItem[];
};

const STOPWORDS = new Set([
  "yang",
  "dan",
  "di",
  "ke",
  "dari",
  "untuk",
  "pada",
  "dalam",
  "dengan",
  "karena",
  "setelah",
  "akan",
  "oleh",
  "atau",
  "ini",
  "itu",
  "para",
  "sejumlah",
  "lebih",
  "masih",
  "hingga",
  "saat",
  "juga",
  "agar",
  "namun",
  "serta",
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "amid",
  "after",
  "before",
  "over",
  "under",
  "today",
  "market",
  "markets",
  "news",
  "stock",
  "stocks",
  "indonesia",
  "indonesian",
  "ihsg",
]);

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const resolveTitle = (article: IndonesiaMarketNewsItem, locale: Locale) => {
  if (locale === "en") {
    return (
      article.title_en?.trim() || article.title_id?.trim() || SECTION_LABEL
    );
  }

  return article.title_id?.trim() || article.title_en?.trim() || SECTION_LABEL;
};

const resolveContent = (article: IndonesiaMarketNewsItem, locale: Locale) => {
  if (locale === "en") {
    return article.content_en?.trim() || article.content_id?.trim() || "";
  }

  return article.content_id?.trim() || article.content_en?.trim() || "";
};

export const isValidIndonesiaMarketNewsArticle = (
  article: IndonesiaMarketNewsItem | null | undefined,
): article is IndonesiaMarketNewsItem => {
  return !!article && !!article.slug;
};

const normalizeCategory = (value?: string | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

const getTimestamp = (item: IndonesiaMarketNewsItem) =>
  new Date(item.updated_at ?? item.created_at ?? 0).getTime();

const buildImageUrl = (article: IndonesiaMarketNewsItem) => {
  if (article.image_url?.trim()) return article.image_url.trim();

  if (article.image?.trim()) {
    return `${PORTAL_BASE_URL}/${article.image.replace(/^\/+/, "")}`;
  }

  return undefined;
};

const getItemText = (item: IndonesiaMarketNewsItem) =>
  [
    item.title_id,
    item.title_en,
    stripHtml(item.content_id ?? ""),
    stripHtml(item.content_en ?? ""),
    item.category,
    item.category_label,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length > 2 && !STOPWORDS.has(token) && !/^\d+$/.test(token),
    );

const toFrequencyMap = (tokens: string[]) => {
  const map = new Map<string, number>();

  for (const token of tokens) {
    map.set(token, (map.get(token) ?? 0) + 1);
  }

  return map;
};

const getSimilarityScore = (
  baseItem: IndonesiaMarketNewsItem,
  candidate: IndonesiaMarketNewsItem,
) => {
  const baseTokens = tokenize(getItemText(baseItem));
  const candidateTokens = tokenize(getItemText(candidate));

  if (!baseTokens.length || !candidateTokens.length) {
    return 0;
  }

  const baseFreq = toFrequencyMap(baseTokens);
  const candidateFreq = toFrequencyMap(candidateTokens);

  let overlapScore = 0;
  for (const [token, count] of baseFreq.entries()) {
    const candidateCount = candidateFreq.get(token) ?? 0;
    overlapScore += Math.min(count, candidateCount);
  }

  const uniqueBase = new Set(baseTokens);
  const uniqueCandidate = new Set(candidateTokens);

  let unionCount = uniqueBase.size;
  for (const token of uniqueCandidate) {
    if (!uniqueBase.has(token)) {
      unionCount += 1;
    }
  }

  const jaccard = unionCount > 0 ? overlapScore / unionCount : 0;

  const titleBase = tokenize(`${baseItem.title_id ?? ""} ${baseItem.title_en ?? ""}`);
  const titleCandidate = tokenize(
    `${candidate.title_id ?? ""} ${candidate.title_en ?? ""}`,
  );

  const titleBaseSet = new Set(titleBase);
  let titleOverlap = 0;
  for (const token of titleCandidate) {
    if (titleBaseSet.has(token)) {
      titleOverlap += 1;
    }
  }

  const titleBoost = Math.min(titleOverlap, 6) * 0.08;

  const categoryBoost =
    normalizeCategory(baseItem.category) === normalizeCategory(candidate.category)
      ? 0.12
      : 0;

  const recencyBoost =
    Math.max(
      0,
      1 -
        Math.abs(getTimestamp(baseItem) - getTimestamp(candidate)) /
          (1000 * 60 * 60 * 24 * 30),
    ) * 0.04;

  return jaccard + titleBoost + categoryBoost + recencyBoost;
};

const getRelatedArticles = (
  current: IndonesiaMarketNewsItem,
  items: IndonesiaMarketNewsItem[],
  limit: number,
) => {
  const currentSlug = current.slug?.trim();

  const scored = items
    .filter((item) => item.slug?.trim() && item.slug?.trim() !== currentSlug)
    .map((item) => ({
      item,
      score: getSimilarityScore(current, item),
      timestamp: getTimestamp(item),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.timestamp - a.timestamp;
    });

  const strongMatches = scored.filter((entry) => entry.score > 0);
  const source = strongMatches.length ? strongMatches : scored;

  return source.slice(0, limit).map((entry) => entry.item);
};

export async function fetchIndonesiaMarketNewsDetail(
  slug: string,
  {
    latestLimit = 5,
    relatedLimit = 5,
  }: {
    latestLimit?: number;
    relatedLimit?: number;
  } = {},
): Promise<{
  article: IndonesiaMarketNewsItem | null;
  latest: IndonesiaMarketNewsItem[];
  related: IndonesiaMarketNewsItem[];
  imageBase: string;
}> {
  const res = await fetch(API_URL, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
      "X-API-TOKEN": API_TOKEN,
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch news: ${res.status}`);
  }

  const json = (await res.json()) as ApiNewsResponse;
  const items = Array.isArray(json.data) ? json.data : [];

  const sorted = [...items]
    .map((item) => ({
      ...item,
      image_url: buildImageUrl(item),
    }))
    .sort((a, b) => getTimestamp(b) - getTimestamp(a));

  const article = sorted.find((item) => item.slug === slug) ?? null;

  if (!article) {
    return {
      article: null,
      latest: [],
      related: [],
      imageBase: PORTAL_BASE_URL,
    };
  }

  const withoutCurrent = sorted.filter((item) => item.slug !== slug);
  const latest = withoutCurrent.slice(0, latestLimit);
  const related = getRelatedArticles(article, withoutCurrent, relatedLimit);

  return {
    article,
    latest,
    related,
    imageBase: PORTAL_BASE_URL,
  };
}

export async function buildIndonesiaMarketNewsMetadata({
  locale,
  slug,
  detailBasePath = INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH,
  resolveDetailBasePath,
}: {
  locale: Locale;
  slug: string;
  detailBasePath?: string;
  resolveDetailBasePath?: (article: IndonesiaMarketNewsItem) => string;
}): Promise<Metadata> {
  const detail = await fetchIndonesiaMarketNewsDetail(slug, {
    latestLimit: 1,
    relatedLimit: 1,
  });

  const article = detail.article;
  const effectiveDetailBasePath =
    resolveDetailBasePath && isValidIndonesiaMarketNewsArticle(article)
      ? resolveDetailBasePath(article)
      : detailBasePath;

  if (!isValidIndonesiaMarketNewsArticle(article)) {
    return {
      title: SECTION_LABEL,
      description:
        locale === "en"
          ? "Pasar Indonesia article detail page."
          : "Halaman detail artikel Pasar Indonesia.",
    };
  }

  const title = resolveTitle(article, locale);
  const description =
    stripHtml(resolveContent(article, locale)).slice(0, 160) ||
    (locale === "en"
      ? "Pasar Indonesia article detail page."
      : "Halaman detail artikel Pasar Indonesia.");

  const imageUrl = buildImageUrl(article);
  const canonicalUrl = SITE_URL
    ? `${SITE_URL}/${locale}/${effectiveDetailBasePath.replace(/^\/+/, "")}/${slug}`
    : undefined;

  return {
    title,
    description,
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      type: "article",
      url: canonicalUrl,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}
