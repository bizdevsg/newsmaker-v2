import { NextResponse } from "next/server";

// Cache the response for 5 minutes (300s) to avoid hammering the external API
export const revalidate = 300;

const NEWS_API =
  process.env.PORTALNEWS_API_URL ??
  process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ??
  "";
const NEWS_TOKEN =
  process.env.PORTALNEWS_TOKEN ??
  process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ??
  "";
const IMAGE_BASE = (
  process.env.PORTALNEWS_IMAGE_BASE ??
  process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE ??
  ""
).replace(/\/$/, "");

type PortalNewsItem = {
  updated_at?: string;
  created_at?: string;
  kategori?: {
    slug?: string;
    name?: string;
  };
};

type PortalNewsResponse = {
  data?: PortalNewsItem[];
};

const normalizeCategory = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function GET(request: Request) {
  try {
    if (!NEWS_API) {
      return NextResponse.json(
        { status: "error", message: "NEWS_API_URL is not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit") || "2");
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 2;
    const category = normalizeCategory(searchParams.get("category"));
    const excludeCategory = normalizeCategory(searchParams.get("excludeCategory"));

    const res = await fetch(NEWS_API, {
      headers: NEWS_TOKEN ? { Authorization: `Bearer ${NEWS_TOKEN}` } : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { status: "error", message: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }
    const json = (await res.json()) as PortalNewsResponse;
    if (!Array.isArray(json.data)) {
      return NextResponse.json(
        { status: "error", message: "Invalid upstream response" },
        { status: 500 }
      );
    }

    const sortedData = [...json.data].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });
    const filteredData = sortedData.filter((item) => {
      const itemCategorySlug = normalizeCategory(item?.kategori?.slug);
      const itemCategoryName = normalizeCategory(item?.kategori?.name);
      const matchesCategory =
        !category ||
        itemCategorySlug === category ||
        itemCategoryName === category;
      const matchesExcludedCategory =
        excludeCategory &&
        (itemCategorySlug === excludeCategory ||
          itemCategoryName === excludeCategory);

      return matchesCategory && !matchesExcludedCategory;
    });

    return NextResponse.json({
      status: "success",
      imageBase: IMAGE_BASE,
      data: filteredData.slice(0, limit),
    });
  } catch (err: unknown) {
    const cause =
      err instanceof Error &&
      err.cause &&
      typeof err.cause === "object" &&
      "code" in err.cause
        ? (err.cause as { code: string }).code
        : undefined;
    return NextResponse.json(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
        cause,
      },
      { status: 500 }
    );
  }
}
