import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

// Cache the response for 5 minutes (300s) to avoid hammering the external API
export const revalidate = 300;

const LEGACY_NEWS_LIST_URL =
  process.env.PORTALNEWS_API_URL ??
  process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ??
  "";

const derivedNewsmakerBaseUrl = LEGACY_NEWS_LIST_URL
  ? LEGACY_NEWS_LIST_URL.replace(
      /\/api\/v1\/berita(?:\/.*)?$/i,
      "/api/v1/newsmaker",
    )
  : "";

const TIKTOK_API =
  process.env.PORTALNEWS_TIKTOK_URL ??
  process.env.NEXT_PUBLIC_PORTALNEWS_TIKTOK_URL ??
  (derivedNewsmakerBaseUrl ? `${derivedNewsmakerBaseUrl}/tiktok` : "");
const NEWS_TOKEN =
  process.env.PORTALNEWS_TOKEN ??
  process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ??
  "";

type TikTokItem = {
  id?: number;
  title?: string;
  embed_code?: string;
  backup_video_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

type TikTokResponse = {
  status?: number | string;
  message?: string;
  data?: TikTokItem[];
};

export async function GET(request: Request) {
  try {
    if (!TIKTOK_API) {
      return NextResponse.json(
        { status: "error", message: "TIKTOK_API_URL is not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit") || "6");
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 6;

    const res = await fetchWithTimeout(TIKTOK_API, {
      headers: NEWS_TOKEN ? { Authorization: `Bearer ${NEWS_TOKEN}` } : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { status: "error", message: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }
    const json = (await res.json()) as TikTokResponse;
    const data = Array.isArray(json?.data) ? json.data : [];

    const sortedData = [...data].sort((a, b) => {
      const dateA = Date.parse(a.updated_at ?? a.created_at ?? "") || 0;
      const dateB = Date.parse(b.updated_at ?? b.created_at ?? "") || 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      status: json?.status ?? "success",
      message: json?.message,
      data: sortedData.slice(0, limit),
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    const cause =
      error.cause && typeof error.cause === "object" && "code" in error.cause
        ? (error.cause as { code: string }).code
        : undefined;
    return NextResponse.json(
      { status: "error", message: error.message, cause },
      { status: 500 }
    );
  }
}
