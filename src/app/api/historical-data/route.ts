import { NextResponse } from "next/server";
import { fetchHistoricalData } from "@/lib/historical-data";

const FIXED_LIMIT = 20;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category")?.trim() || undefined;
  const tanggal = url.searchParams.get("tanggal")?.trim() || undefined;
  const start = url.searchParams.get("start")?.trim() || undefined;
  const end = url.searchParams.get("end")?.trim() || undefined;

  const data = await fetchHistoricalData({
    limit: FIXED_LIMIT,
    category,
    tanggal,
    start,
    end,
  });
  return NextResponse.json(
    { status: 200, message: "OK", data },
    { status: 200 },
  );
}
