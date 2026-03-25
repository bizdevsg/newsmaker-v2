import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

const UPSTREAM_URL =
  "https://endpoapi-production-3202.up.railway.app/api/live-quotes";

export async function GET() {
  try {
    const response = await fetchWithTimeout(UPSTREAM_URL, {
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json(
        { status: "error", error: "upstream_failed" },
        { status: response.status },
      );
    }
    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { status: "error", error: "upstream_unreachable" },
      { status: 502 },
    );
  }
}
