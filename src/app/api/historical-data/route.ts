import { NextResponse } from "next/server";
import { fetchHistoricalData } from "@/lib/historical-data";

const parseLimit = (value: string | null) => {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(1, Math.min(500, Math.floor(parsed)));
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const category = url.searchParams.get("category")?.trim() || undefined;
  const tanggal = url.searchParams.get("tanggal")?.trim() || undefined;

  const data = await fetchHistoricalData({ limit, category, tanggal });
  return NextResponse.json(
    { status: 200, message: "OK", data },
    { status: 200 },
  );
}

