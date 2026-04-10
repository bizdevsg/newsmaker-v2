import { NextResponse } from "next/server";
import {
  fetchPasarIndonesiaAnalysis,
  getPortalNewsItemTimestamp,
  PORTALNEWS_IMAGE_BASE,
  type PortalNewsItem,
} from "@/lib/portalnews";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const parsePositiveInt = (value: string | null) => {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const applyLimit = (items: PortalNewsItem[], limit: number | null) =>
  typeof limit === "number" ? items.slice(0, limit) : items;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parsePositiveInt(searchParams.get("limit"));

    const { items, source } = await fetchPasarIndonesiaAnalysis();
    const sortedItems = [...items].sort(
      (left, right) => getPortalNewsItemTimestamp(right) - getPortalNewsItemTimestamp(left),
    );

    return NextResponse.json(
      {
        status: "success",
        type: "analisis",
        source,
        imageBase: PORTALNEWS_IMAGE_BASE,
        data: applyLimit(sortedItems, limit),
        count: sortedItems.length,
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
