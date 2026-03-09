import { NextResponse } from "next/server";

const API_TOKEN =
  "BG0EvCDjcNWAMwmdewC1wz584oEGfU5QiKXGdZQ2qkOro8Hn4FD5OYLHOcUJtLuj";
const API_URL = "https://endpo-nm23.vercel.app/api/newsmaker-v2/investing";

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
