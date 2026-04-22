import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { buildPublicCacheControl, getCachedValue } from "@/lib/server-cache";

const UPSTREAM_URL =
  "https://endpoapi-production-3202.up.railway.app/api/live-quotes";
const LIVE_QUOTES_CACHE_TTL_SECONDS = 2;
const LIVE_QUOTES_CACHE_CONTROL = buildPublicCacheControl(
  LIVE_QUOTES_CACHE_TTL_SECONDS,
  5,
);

export async function GET() {
  try {
    const data = await getCachedValue(
      "live-quotes",
      LIVE_QUOTES_CACHE_TTL_SECONDS,
      async () => {
        const response = await fetchWithTimeout(UPSTREAM_URL);
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
        "Cache-Control": LIVE_QUOTES_CACHE_CONTROL,
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
      },
    );
  }
}
