import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ApiItemBase = {
  id?: number;
  slug?: string;
  title_id?: string;
  title_en?: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
  category_label?: string;
  kategori?: {
    name?: string;
    slug?: string;
  };
  main_category?: {
    name?: string;
    slug?: string;
  };
  sub_category?: {
    name?: string;
    slug?: string;
  };
};

type TickerNewsItem = ApiItemBase & {
  type: "berita";
  titles?: { default?: string; id?: string; en?: string };
};

type ApiPayload<T> = {
  status?: string;
  data?: T;
};

const DEFAULT_NEWS_URL = "http://portalnews.newsmaker.test/api/v1/newsmaker/berita";

const NEWS_URL = (
  process.env.PORTALNEWS_NEWS_LIST_URL ??
  process.env.PORTALNEWS_API_URL ??
  process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ??
  DEFAULT_NEWS_URL
).replace(/\/$/, "");

const TOKEN =
  process.env.PORTALNEWS_TOKEN ??
  process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ??
  "NPLD3SC2N06VVZYKUY5CRHJUQE3HSJ";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const getTimestamp = (item: Pick<ApiItemBase, "updated_at" | "created_at">) => {
  const value = item.updated_at ?? item.created_at;
  const timestamp = Date.parse(value ?? "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const toTickerItem = (
  value: unknown,
): TickerNewsItem | null => {
  if (!isRecord(value)) return null;

  const id = typeof value.id === "number" ? value.id : undefined;
  const slug = normalizeText(value.slug) || undefined;

  const titleId = normalizeText(value.title_id) || undefined;
  const titleEn = normalizeText(value.title_en) || undefined;
  const title = normalizeText(value.title) || titleId || titleEn || undefined;

  const created_at = normalizeText(value.created_at) || undefined;
  const updated_at = normalizeText(value.updated_at) || undefined;

  const category = normalizeText(value.category) || undefined;
  const category_label = normalizeText(value.category_label) || undefined;
  const kategori = isRecord(value.kategori)
    ? {
        name: normalizeText(value.kategori.name) || undefined,
        slug: normalizeText(value.kategori.slug) || undefined,
      }
    : undefined;
  const main_category = isRecord(value.main_category)
    ? {
        name: normalizeText(value.main_category.name) || undefined,
        slug: normalizeText(value.main_category.slug) || undefined,
      }
    : undefined;
  const sub_category = isRecord(value.sub_category)
    ? {
        name: normalizeText(value.sub_category.name) || undefined,
        slug: normalizeText(value.sub_category.slug) || undefined,
      }
    : undefined;

  return {
    id,
    type: "berita",
    slug,
    title_id: titleId,
    title_en: titleEn,
    title,
    titles: {
      default: titleId || titleEn || title,
      id: titleId,
      en: titleEn,
    },
    created_at,
    updated_at,
    category,
    category_label,
    kategori,
    main_category,
    sub_category,
  };
};

const fetchApiList = async <T,>(url: string): Promise<ApiPayload<T> | null> => {
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
        cache: "no-store",
        next: { revalidate: 0 },
      },
      10_000,
    );

    if (!response.ok) return null;
    return (await response.json().catch(() => null)) as ApiPayload<T> | null;
  } catch {
    return null;
  }
};

export async function GET() {
  try {
    const newsPayload = await fetchApiList<unknown[]>(NEWS_URL);
    const newsItems = Array.isArray(newsPayload?.data) ? newsPayload?.data : [];

    const merged: TickerNewsItem[] = newsItems
      .map((item) => toTickerItem(item))
      .filter((item): item is TickerNewsItem => item !== null)
      .sort((a, b) => getTimestamp(b) - getTimestamp(a));

    const seen = new Set<string>();
    const unique = merged.filter((item) => {
      const key = item.slug || (item.id !== undefined ? String(item.id) : "");
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json(
      {
        status: "success",
        data: unique.slice(0, 5),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  }
}
