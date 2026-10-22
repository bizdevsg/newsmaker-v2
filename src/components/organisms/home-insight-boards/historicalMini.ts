import type { HistoricalDataItem } from "@/lib/historical-data";

// Same product list as the Historical Data tool, so the dropdown here stays
// consistent with it.
export const CATEGORY_OPTIONS = [
  "LGD Daily",
  "BCO Daily",
  "HSI Daily",
  "SNI Daily",
  "AUD/USD",
  "EUR/USD",
  "GBP/USD",
  "USD/CHF",
  "USD/JPY",
] as const;

export const DEFAULT_CATEGORY: (typeof CATEGORY_OPTIONS)[number] = "LGD Daily";

export const HISTORICAL_MINI_ROWS = 6;

export const parseTimestamp = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeCategory = (value: string | null) =>
  (value ?? "").trim().toLowerCase();

/**
 * Keeps only the latest rows per dropdown product so the home page doesn't
 * ship the full historical dataset to the client.
 */
export function pickLatestHistoricalRows(items: HistoricalDataItem[]) {
  const wanted = new Set(CATEGORY_OPTIONS.map((c) => c.toLowerCase()));
  const byCategory = new Map<string, HistoricalDataItem[]>();

  for (const item of items) {
    const key = normalizeCategory(item.category);
    if (!wanted.has(key)) continue;
    const list = byCategory.get(key) ?? [];
    list.push(item);
    byCategory.set(key, list);
  }

  return Array.from(byCategory.values()).flatMap((list) =>
    list
      .sort((a, b) => parseTimestamp(b.tanggal) - parseTimestamp(a.tanggal))
      .slice(0, HISTORICAL_MINI_ROWS),
  );
}
