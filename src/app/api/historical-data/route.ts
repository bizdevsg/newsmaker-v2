import { NextResponse } from "next/server";
import { fetchHistoricalData } from "@/lib/historical-data";
import { buildPublicCacheControl } from "@/lib/server-cache";

const HISTORICAL_DATA_CACHE_CONTROL = buildPublicCacheControl(300, 600);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLimit = url.searchParams.get("limit")?.trim();
  const parsedLimit = rawLimit ? Number(rawLimit) : NaN;
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : undefined;
  const category = url.searchParams.get("category")?.trim() || undefined;
  const tanggal = url.searchParams.get("tanggal")?.trim() || undefined;
  const start = url.searchParams.get("start")?.trim() || undefined;
  const end = url.searchParams.get("end")?.trim() || undefined;

  const data = await fetchHistoricalData({
    limit,
    category,
    tanggal,
    start,
    end,
  });
  return NextResponse.json(
    { status: 200, message: "OK", data },
    {
      status: 200,
      headers: {
        "Cache-Control": HISTORICAL_DATA_CACHE_CONTROL,
      },
    },
  );
}
