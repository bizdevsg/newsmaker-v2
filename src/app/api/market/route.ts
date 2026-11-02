import { NextResponse } from "next/server";
import { getInvesting } from "@/lib/endpo.server";

// Cache endpo 60 detik, jadi polling lebih rapat tidak menambah data baru.
const POLL_INTERVAL_MS = 30_000;

type MarketItem = {
  symbol: string;
  price: number;
  change?: number;
  change_percent?: number;
};

// /investing sesekali membalas data kosong, board tetap pakai data valid terakhir.
let lastGood: { at: string; data: MarketItem[] } | null = null;
// Kegagalan tidak di-cache oleh fetch, jadi semua polling dibatasi di sini supaya
// endpo yang sedang down tidak ditembak terus oleh tiap pengunjung.
let lastCheckedAt = 0;
let refreshing: Promise<void> | null = null;

const refreshMarket = async () => {
  const { data: investing } = await getInvesting();
  const rows = Array.isArray(investing?.data) ? investing.data : [];

  const items = rows.flatMap((row) =>
    row.symbol && typeof row.last === "number"
      ? [
          {
            symbol: row.symbol,
            price: row.last,
            change: row.change,
            change_percent: row.change_percent,
          },
        ]
      : [],
  );

  if (items.length > 0) {
    lastGood = {
      at: investing?.fetched_at ?? new Date().toISOString(),
      data: items,
    };
  }
};

export async function GET() {
  if (!refreshing && Date.now() - lastCheckedAt >= POLL_INTERVAL_MS) {
    lastCheckedAt = Date.now();
    refreshing = refreshMarket().finally(() => {
      refreshing = null;
    });
  }
  if (refreshing) await refreshing;

  if (!lastGood) {
    return NextResponse.json(
      { status: "error", error: "upstream_failed" },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      type: "market",
      transport: "polling",
      interval_ms: POLL_INTERVAL_MS,
      ...lastGood,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
