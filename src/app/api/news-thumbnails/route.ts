import { NextResponse } from "next/server";
import {
  buildPortalNewsImageUrl,
  fetchPortalNewsList,
} from "@/lib/portalnews";

export const revalidate = 300;

export async function GET() {
  try {
    const { items } = await fetchPortalNewsList();

    const thumbMapById: Record<number, string> = {};
    const thumbMapBySlug: Record<string, string> = {};

    items.forEach((item) => {
      const image = buildPortalNewsImageUrl(item.images?.[0]);
      if (!image) return;

      if (typeof item.category_id === "number" && !thumbMapById[item.category_id]) {
        thumbMapById[item.category_id] = image;
      }

      const slug = item.kategori?.slug;
      if (typeof slug === "string" && slug && !thumbMapBySlug[slug]) {
        thumbMapBySlug[slug] = image;
      }
    });

    return NextResponse.json({
      status: "success",
      data: { byId: thumbMapById, bySlug: thumbMapBySlug },
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
