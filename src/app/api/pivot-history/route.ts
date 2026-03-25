import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

const API_TOKEN = process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ?? "";
const API_URL = process.env.PORTALNEWS_PIVOT_HISTORY_URL ?? "";

export async function GET() {
  try {
    const response = await fetchWithTimeout(API_URL, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pivot history data" },
      { status: 500 },
    );
  }
}
