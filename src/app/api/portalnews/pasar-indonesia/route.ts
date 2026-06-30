import { NextResponse } from "next/server";
import { fetchIndonesiaMarketNewsDetail } from "@/lib/indonesia-market-news";

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

async function fetchPasarIndonesiaPage(url: string): Promise<ApiNewsResponse> {
  const res = await fetch(url, {
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

  return (await res.json()) as ApiNewsResponse;
}

async function fetchPasarIndonesiaNews(maxItems: number | null): Promise<PortalNewsItem[]> {
  const initialUrl = API_URL;
  const items: PortalNewsItem[] = [];
  const seenSlugs = new Set<string>();
  let nextUrl: string | null = initialUrl;

  while (nextUrl && (maxItems == null || items.length < maxItems)) {
    const json = await fetchPasarIndonesiaPage(nextUrl);
    const pageItems = Array.isArray(json.data) ? json.data : [];

    for (const item of pageItems.map(normalizeItem)) {
      const key = item.slug?.trim() || String(item.id ?? "").trim();
      if (!key || seenSlugs.has(key)) continue;
      seenSlugs.add(key);
      items.push(item);
    }

    const pagination = json.meta?.pagination;
    nextUrl =
      pagination?.has_more_pages &&
      pagination.next_page_url &&
      (maxItems == null || items.length < maxItems)
        ? pagination.next_page_url
        : null;
  }

  return items;
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
    const neededItems =
      slugParam || limit || offset != null
        ? Math.max((offset ?? 0) + (limit ?? 20), latestLimit + relatedLimit, 20)
        : 20;

    if (slugParam) {
      const detail = await fetchIndonesiaMarketNewsDetail(slugParam, {
        latestLimit,
        relatedLimit,
      });

      return NextResponse.json(
        {
          status: "success",
          source: "Portal News API",
          imageBase: detail.imageBase,
          data: detail.article,
          latest: detail.latest,
          related: detail.related,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        },
      );
    }

    const allItems = await fetchPasarIndonesiaNews(neededItems);

    const sortedItems = [...allItems].sort((left, right) => {
      const leftTime = getTimestamp(left);
      const rightTime = getTimestamp(right);
      return sortBy === "oldest" ? leftTime - rightTime : rightTime - leftTime;
    });

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
