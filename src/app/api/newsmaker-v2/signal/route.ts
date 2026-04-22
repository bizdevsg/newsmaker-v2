import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { buildPublicCacheControl, getCachedValue } from "@/lib/server-cache";

const API_BASE =
  process.env.ENDPO_NM23_BASE ??
  process.env.NEXT_PUBLIC_ENDPOAPI_BASE ??
  "https://endpo-nm23.vercel.app";
const API_TOKEN = process.env.ENDPO_NM23_TOKEN ?? "";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const SIGNAL_CACHE_TTL_SECONDS = 30;
const SIGNAL_CACHE_CONTROL = buildPublicCacheControl(
  SIGNAL_CACHE_TTL_SECONDS,
  60,
);

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim() || "XAUUSD";
  const interval =
    request.nextUrl.searchParams.get("interval")?.trim() || "1min";

  const url = new URL("/api/newsmaker-v2/signal", API_BASE);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", interval);

  try {
    const data = await getCachedValue(
      `signal:${symbol}:${interval}`,
      SIGNAL_CACHE_TTL_SECONDS,
      async () => {
        const response = await fetchWithTimeout(
          url,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
            },
          },
          10_000,
        );

        if (!response.ok) {
          const error = new Error("upstream_failed") as Error & {
            status?: number;
          };
          error.status = response.status;
          throw error;
        }

        return response.json();
      },
    );

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": SIGNAL_CACHE_CONTROL,
      },
    });
  } catch (error: unknown) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 502;

    return NextResponse.json(
      {
        status: "error",
        error: status === 502 ? "upstream_unreachable" : "upstream_failed",
      },
      {
        status,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
