import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { getCachedValue } from "@/lib/server-cache";

export type HistoricalDataItem = {
  id: number;
  tanggal: string;
  open: string | null;
  high: string | null;
  low: string | null;
  close: string | null;
  chg: string | number | null;
  isBankHoliday: boolean;
  description: string | null;
  category: string | null;
  volume: string | number | null;
  open_interest: string | number | null;
};

type ApiPayload = {
  Code?: number;
  status?: string;
  data?: unknown;
};

const DEFAULT_HISTORICAL_DATA_URL =
  "https://portalnews.newsmaker.id/api/v1/newsmaker/historical-data";
const LOCAL_HISTORICAL_DATA_URL =
  "http://portalnews.newsmaker.test/api/v1/newsmaker/historical-data";

const TOKEN =
  process.env.PORTALNEWS_HISTORICAL_DATA_TOKEN ??
  process.env.PORTALNEWS_TOKEN ??
  process.env.PORTALNEWS_PASAR_INDONESIA_TOKEN ??
  process.env.PORTALNEWS_REGULATORY_WATCH_TOKEN ??
  process.env.PORTALNEWS_ECONOMIC_CALENDAR_TOKEN ??
  "";

const HISTORICAL_DATA_CACHE_TTL_SECONDS = 300;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toText = (value: unknown) => (typeof value === "string" ? value : "");

const toNullableText = (value: unknown) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text : null;
};

const toItem = (value: unknown): HistoricalDataItem | null => {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "number" ? value.id : Number(value.id);
  if (!Number.isFinite(id)) return null;

  const tanggal =
    toText(value.tanggal).trim() ||
    toText(value.date).trim() ||
    toText(value.tgl).trim();
  if (!tanggal) return null;

  return {
    id,
    tanggal,
    open: toNullableText(value.open),
    high: toNullableText(value.high),
    low: toNullableText(value.low),
    close: toNullableText(value.close),
    chg: (value.chg as HistoricalDataItem["chg"]) ?? null,
    isBankHoliday: Boolean(value.isBankHoliday ?? value.bankHoliday),
    description: toNullableText(value.description),
    category: toNullableText(value.category),
    volume: (value.volume as HistoricalDataItem["volume"]) ?? null,
    open_interest:
      (value.open_interest as HistoricalDataItem["open_interest"]) ??
      (value.openInterest as HistoricalDataItem["open_interest"]) ??
      null,
  };
};

export async function fetchHistoricalData(params?: {
  limit?: number;
  category?: string;
  tanggal?: string;
  start?: string;
  end?: string;
}) {
  const limit =
    typeof params?.limit === "number" && Number.isFinite(params.limit)
      ? Math.max(1, Math.min(500, Math.floor(params.limit)))
      : undefined;
  const category = params?.category?.trim();
  const tanggal = params?.tanggal?.trim();
  const start = params?.start?.trim();
  const end = params?.end?.trim();
  const configuredUrl = process.env.PORTALNEWS_HISTORICAL_DATA_URL?.trim() || "";

  const cacheKey = JSON.stringify({
    category: category || "",
    limit: limit ?? "",
    tanggal: tanggal || "",
  });

  const mapped = await getCachedValue(
    `historical-data:${cacheKey}`,
    HISTORICAL_DATA_CACHE_TTL_SECONDS,
    async () => {
      const requestUrls = Array.from(
        new Set(
          configuredUrl
            ? [configuredUrl, DEFAULT_HISTORICAL_DATA_URL]
            : [DEFAULT_HISTORICAL_DATA_URL],
        ),
      );

      const failures: Array<{ requestUrl: string; error: unknown }> = [];

      for (const requestUrl of requestUrls) {
        try {
          const url = new URL(requestUrl);

          if (limit) url.searchParams.set("limit", String(limit));
          if (category) url.searchParams.set("category", category);
          if (tanggal) url.searchParams.set("tanggal", tanggal);

          const response = await fetchWithTimeout(
            url.toString(),
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                ...(TOKEN
                  ? {
                      Authorization: `Bearer ${TOKEN}`,
                      "X-API-TOKEN": TOKEN,
                    }
                  : {}),
              },
            },
            10_000,
          );

          if (!response.ok) continue;

          const payload = (await response.json().catch(() => null)) as
            | ApiPayload
            | null;
          const rawList = payload && isRecord(payload) ? payload.data : null;
          if (!Array.isArray(rawList)) continue;

          return rawList
            .map(toItem)
            .filter((item): item is HistoricalDataItem => item !== null);
        } catch (error) {
          failures.push({ requestUrl, error });
        }
      }

      if (failures.length) {
        console.error("[historical-data] all fetch attempts failed", {
          requestUrls,
          failures,
          localDevHint:
            configuredUrl || requestUrls.includes(LOCAL_HISTORICAL_DATA_URL)
              ? undefined
              : `Set PORTALNEWS_HISTORICAL_DATA_URL=${LOCAL_HISTORICAL_DATA_URL} to use the local Portalnews host.`,
        });
      }

      return [];
    },
  );

  if (!mapped.length) {
    return [];
  }

  const normalizedCategory = category ? category.toLowerCase() : "";
  const filteredByCategory = normalizedCategory
    ? mapped.filter(
        (item) => (item.category ?? "").trim().toLowerCase() === normalizedCategory,
      )
    : mapped;

  const parseDate = (value?: string) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized) return null;
    const ts = Date.parse(normalized);
    return Number.isFinite(ts) ? ts : null;
  };

  const startTs = parseDate(start);
  const endTs = parseDate(end);
  const rangeStart = startTs !== null && endTs !== null ? Math.min(startTs, endTs) : startTs;
  const rangeEnd = startTs !== null && endTs !== null ? Math.max(startTs, endTs) : endTs;

  const filteredByDate =
    rangeStart === null && rangeEnd === null
      ? filteredByCategory
      : filteredByCategory.filter((item) => {
          const itemTs = parseDate(item.tanggal);
          if (itemTs === null) return false;
          if (rangeStart !== null && itemTs < rangeStart) return false;
          if (rangeEnd !== null && itemTs > rangeEnd) return false;
          return true;
        });

  return limit ? filteredByDate.slice(0, limit) : filteredByDate;
}
