import { NextResponse } from "next/server";

const API_TOKEN = "EWF-06433b884f930161";
const API_URL = "https://portalnews.newsmaker.id/api/v1/pivot-history";

export async function GET() {
  try {
    const response = await fetch(API_URL, {
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
