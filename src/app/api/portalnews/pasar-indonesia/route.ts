import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export type PortalNewsItem = {
  id?: number;
  type?: string;
  slug?: string;
  image?: string;
  image_url?: string;
  images?: string[];
  title?: string;
  title_id?: string;
  title_en?: string;
  titles?: {
    default?: string;
    id?: string;
    en?: string;
  };
  content?: string;
  content_id?: string;
  content_en?: string;
  contents?: {
    default?: string;
    id?: string;
    en?: string;
  };
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
  data?: PortalNewsItem[];
  meta?: {
    filters?: {
      category?: string | null;
    };
    available_categories?: Array<{
      value?: string;
      label?: string;
    }>;
    pagination?: {
      current_page?: number;
      per_page?: number;
      total?: number;
      last_page?: number;
      from?: number;
      to?: number;
      has_more_pages?: boolean;
      prev_page_url?: string | null;
      next_page_url?: string | null;
    };
  };
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

const parsePositiveInt = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parseNonNegativeInt = (value: string | null) => {
  if (value == null) return null;
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const applyWindow = (
  items: PortalNewsItem[],
  offset: number | null,
  limit: number | null,
) => {
  const start = offset ?? 0;
  const end = typeof limit === "number" ? start + limit : undefined;
  return items.slice(start, end);
};

const normalizeCategory = (value?: string | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

const getTimestamp = (item: PortalNewsItem) =>
  new Date(item.updated_at ?? item.created_at ?? 0).getTime();

const matchesCategory = (item: PortalNewsItem, value: string) => {
  const normalizedNeedle = normalizeCategory(value);
  if (!normalizedNeedle) return true;

  const itemCategories = [item.category, item.category_label]
    .filter(Boolean)
    .map((cat) => normalizeCategory(cat));

  return itemCategories.includes(normalizedNeedle);
};

const buildImageUrl = (item: PortalNewsItem) => {
  if (item.image_url?.trim()) return item.image_url.trim();

  if (item.image?.trim()) {
    const normalizedPath = item.image.replace(/^\/+/, "");
    return `${PORTAL_BASE_URL}/${normalizedPath}`;
  }

  return undefined;
};

const normalizeItem = (item: PortalNewsItem): PortalNewsItem => {
  const resolvedImageUrl = buildImageUrl(item);

  const titleDefault =
    item.title_id?.trim() || item.title_en?.trim() || item.title?.trim() || "";
  const contentDefault =
    item.content_id?.trim() ||
    item.content_en?.trim() ||
    item.content?.trim() ||
    "";

  return {
    ...item,
    image_url: resolvedImageUrl,
    images: resolvedImageUrl ? [resolvedImageUrl] : [],
    title: titleDefault || undefined,
    titles: {
      default: titleDefault || undefined,
      id: item.title_id,
      en: item.title_en,
    },
    content: contentDefault || undefined,
    contents: {
      default: contentDefault || undefined,
      id: item.content_id,
      en: item.content_en,
    },
  };
};

const stripHtml = (value: string) =>
  value
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

const getItemText = (item: PortalNewsItem) =>
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
  baseItem: PortalNewsItem,
  candidate: PortalNewsItem,
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

  const titleBase = tokenize(
    `${baseItem.title_id ?? ""} ${baseItem.title_en ?? ""}`,
  );
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
    normalizeCategory(baseItem.category) ===
    normalizeCategory(candidate.category)
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
  current: PortalNewsItem,
  items: PortalNewsItem[],
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

async function fetchPasarIndonesiaNews(): Promise<PortalNewsItem[]> {
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
    const error = new Error(`Failed to fetch portal news: ${res.status}`);
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }

  const json = (await res.json()) as ApiNewsResponse;
  const items = Array.isArray(json.data) ? json.data : [];

  return items.map(normalizeItem);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const slugParam = searchParams.get("slug")?.trim() ?? "";
    const limit = parsePositiveInt(searchParams.get("limit"));
    const offset = parseNonNegativeInt(searchParams.get("offset"));
    const category = searchParams.get("category")?.trim() ?? "";
    const excludeCategory = searchParams.get("excludeCategory")?.trim() ?? "";
    const sortBy = searchParams.get("sortBy")?.trim() ?? "newest";

    const latestLimit = parsePositiveInt(searchParams.get("latestLimit")) ?? 5;
    const relatedLimit =
      parsePositiveInt(searchParams.get("relatedLimit")) ?? 5;

    const allItems = await fetchPasarIndonesiaNews();

    const sortedItems = [...allItems].sort((left, right) => {
      const leftTime = getTimestamp(left);
      const rightTime = getTimestamp(right);
      return sortBy === "oldest" ? leftTime - rightTime : rightTime - leftTime;
    });

    if (slugParam) {
      const article =
        sortedItems.find((item) => item.slug?.trim() === slugParam) ?? null;

      if (!article) {
        return NextResponse.json(
          {
            status: "not_found",
            imageBase: PORTAL_BASE_URL,
            data: null,
            latest: [],
            related: [],
          },
          {
            status: 404,
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            },
          },
        );
      }

      const currentSlug = article.slug?.trim();

      const withoutCurrent = sortedItems.filter(
        (item) => item.slug?.trim() && item.slug?.trim() !== currentSlug,
      );

      const latest = withoutCurrent.slice(0, latestLimit);
      const related = getRelatedArticles(article, withoutCurrent, relatedLimit);

      return NextResponse.json(
        {
          status: "success",
          source: article.source ?? "Portal News API",
          imageBase: PORTAL_BASE_URL,
          data: article,
          latest,
          related,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        },
      );
    }

    const filteredItems = sortedItems.filter((item) => {
      const matchesIncluded = category ? matchesCategory(item, category) : true;
      const matchesExcluded = excludeCategory
        ? matchesCategory(item, excludeCategory)
        : false;

      return matchesIncluded && !matchesExcluded;
    });

    return NextResponse.json(
      {
        status: "success",
        source: "Portal News API",
        imageBase: PORTAL_BASE_URL,
        data: applyWindow(filteredItems, offset, limit),
        count: filteredItems.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch (error: unknown) {
    const status =
      typeof (error as { status?: unknown })?.status === "number"
        ? ((error as { status: number }).status as number)
        : undefined;

    return NextResponse.json(
      {
        // Keep the UI stable even when the upstream local API is down.
        status: "success",
        source: "Portal News API",
        warning: error instanceof Error ? error.message : "Unknown error",
        upstreamStatus: status,
        imageBase: PORTAL_BASE_URL,
        data: [],
        count: 0,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  }
}
