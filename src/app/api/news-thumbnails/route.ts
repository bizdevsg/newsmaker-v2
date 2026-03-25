import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { NextResponse } from "next/server";

// Cache the response for 5 minutes (300s) to avoid hammering the external API
export const revalidate = 300;

const NEWS_API = process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ?? "";
const NEWS_TOKEN = process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ?? "";
const IMAGE_BASE = (
  process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE ?? ""
).replace(/\/$/, "");

export async function GET() {
  try {
    const res = await fetchWithTimeout(NEWS_API, {
      headers: { Authorization: `Bearer ${NEWS_TOKEN}` },
      cache: "no-store",
    });
    const json = await res.json();

    if (!json?.data) {
      return NextResponse.json({ status: "error" }, { status: 500 });
    }

    // Build maps: category_id -> thumbnail, kategori.slug -> thumbnail
    const thumbMapById: Record<number, string> = {};
    const thumbMapBySlug: Record<string, string> = {};

    for (const item of json.data) {
      const image = item.images?.[0];
      if (!image) continue;

      // Sanitize: avoid double-slash if image path starts with /
      const imagePath = image.startsWith("/") ? image : `/${image}`;
      const url = `${IMAGE_BASE}${imagePath}`;

      if (
        typeof item.category_id === "number" &&
        !thumbMapById[item.category_id]
      ) {
        thumbMapById[item.category_id] = url;
      }

      const slug = item.kategori?.slug;
      if (typeof slug === "string" && slug && !thumbMapBySlug[slug]) {
        thumbMapBySlug[slug] = url;
      }
    }

    return NextResponse.json({
      status: "success",
      data: { byId: thumbMapById, bySlug: thumbMapBySlug },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 },
    );
  }
}
