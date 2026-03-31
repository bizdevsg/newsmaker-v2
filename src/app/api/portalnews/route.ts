import { NextResponse } from "next/server";
import { fetchPortalNewsDetail } from "@/lib/portalnews-detail";
import {
  fetchPortalNewsList,
  getPortalNewsCategoryKeys,
  getPortalNewsItemTimestamp,
  normalizePortalNewsCategory,
  PORTALNEWS_IMAGE_BASE,
  type PortalNewsItem,
} from "@/lib/portalnews";

export const revalidate = 300;

const parsePositiveInt = (value: string | null) => {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const applyLimit = (items: PortalNewsItem[], limit: number | null) =>
  typeof limit === "number" ? items.slice(0, limit) : items;

const matchesCategory = (item: PortalNewsItem, value: string) => {
  const normalizedValue = normalizePortalNewsCategory(value);

  return (
    !normalizedValue ||
    getPortalNewsCategoryKeys(item).some((key) => key === normalizedValue)
  );
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim();

    if (slug) {
      const latestLimit = parsePositiveInt(searchParams.get("latestLimit")) ?? 5;
      const relatedLimit =
        parsePositiveInt(searchParams.get("relatedLimit")) ?? 3;
      const popularLimit =
        parsePositiveInt(searchParams.get("popularLimit")) ?? 5;
      const detail = await fetchPortalNewsDetail(slug, {
        latestLimit,
        popularLimit,
        relatedLimit,
      });

      return NextResponse.json({
        status: "success",
        source: detail.source,
        imageBase: detail.imageBase,
        data: detail.article,
        latest: detail.latest,
        related: detail.related,
        popular: detail.popular,
      });
    }

    const limit = parsePositiveInt(searchParams.get("limit"));
    const category = searchParams.get("category")?.trim() ?? "";
    const excludeCategory = searchParams.get("excludeCategory")?.trim() ?? "";

    const { items, source } = await fetchPortalNewsList();
    const sortedItems = [...items].sort(
      (left, right) =>
        getPortalNewsItemTimestamp(right) - getPortalNewsItemTimestamp(left),
    );

    const filteredItems = sortedItems.filter((item) => {
      const matchesIncluded = category ? matchesCategory(item, category) : true;
      const matchesExcluded = excludeCategory
        ? matchesCategory(item, excludeCategory)
        : false;

      return matchesIncluded && !matchesExcluded;
    });

    return NextResponse.json({
      status: "success",
      source,
      imageBase: PORTALNEWS_IMAGE_BASE,
      data: applyLimit(filteredItems, limit),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
