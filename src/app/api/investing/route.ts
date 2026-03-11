import { NextResponse } from "next/server";

const API_TOKEN = process.env.ENDPO_NM23_TOKEN ?? "";
const API_BASE = process.env.ENDPO_NM23_BASE ?? "";
const API_URL = `${API_BASE}/api/newsmaker-v2/investing`;

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
      { error: "Failed to fetch investing data" },
      { status: 500 },
    );
  }
}
