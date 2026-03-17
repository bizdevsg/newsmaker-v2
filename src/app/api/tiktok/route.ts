import { NextResponse } from "next/server";

// Cache the response for 5 minutes (300s) to avoid hammering the external API
export const revalidate = 300;

const TIKTOK_API =
  process.env.PORTALNEWS_TIKTOK_URL ??
  process.env.NEXT_PUBLIC_PORTALNEWS_TIKTOK_URL ??
  "";
const NEWS_TOKEN =
  process.env.PORTALNEWS_TOKEN ??
  process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ??
  "";

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

    const res = await fetch(TIKTOK_API, {
      headers: NEWS_TOKEN ? { Authorization: `Bearer ${NEWS_TOKEN}` } : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { status: "error", message: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }
    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];

    const sortedData = data.sort((a: any, b: any) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      status: "success",
      data: sortedData.slice(0, limit),
    });
  } catch (err: any) {
    const cause =
      err?.cause && typeof err.cause === "object" && "code" in err.cause
        ? (err.cause as { code: string }).code
        : undefined;
    return NextResponse.json(
      { status: "error", message: err.message, cause },
      { status: 500 }
    );
  }
}
