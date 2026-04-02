import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import type { FocusReportItem } from "@/types/focusReport";

const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

type FocusReportMarketSeed = {
  symbol: string;
  displaySymbol: string;
  fallbackName: string;
  group: "index" | "equity";
};

const FOCUS_REPORT_MARKETS: FocusReportMarketSeed[] = [
  {
    symbol: "^JKSE",
    displaySymbol: "IHSG",
    fallbackName: "IDX Composite",
    group: "index",
  },
  {
    symbol: "^JKLQ45",
    displaySymbol: "LQ45",
    fallbackName: "IDX LQ45",
    group: "index",
  },
  {
    symbol: "BBCA.JK",
    displaySymbol: "BBCA",
    fallbackName: "Bank Central Asia Tbk",
    group: "equity",
  },
  {
    symbol: "BBRI.JK",
    displaySymbol: "BBRI",
    fallbackName: "Bank Rakyat Indonesia (Persero) Tbk",
    group: "equity",
  },
  {
    symbol: "BBNI.JK",
    displaySymbol: "BBNI",
    fallbackName: "Bank Negara Indonesia (Persero) Tbk",
    group: "equity",
  },
  {
    symbol: "BMRI.JK",
    displaySymbol: "BMRI",
    fallbackName: "Bank Mandiri (Persero) Tbk",
    group: "equity",
  },
  {
    symbol: "TLKM.JK",
    displaySymbol: "TLKM",
    fallbackName: "Telkom Indonesia (Persero) Tbk",
    group: "equity",
  },
  {
    symbol: "ASII.JK",
    displaySymbol: "ASII",
    fallbackName: "Astra International Tbk",
    group: "equity",
  },
  {
    symbol: "UNVR.JK",
    displaySymbol: "UNVR",
    fallbackName: "Unilever Indonesia Tbk",
    group: "equity",
  },
  {
    symbol: "ICBP.JK",
    displaySymbol: "ICBP",
    fallbackName: "Indofood CBP Sukses Makmur Tbk",
    group: "equity",
  },
];

type YahooChartMeta = {
  symbol?: unknown;
  shortName?: unknown;
  longName?: unknown;
  instrumentType?: unknown;
  regularMarketPrice?: unknown;
  previousClose?: unknown;
  chartPreviousClose?: unknown;
  priceHint?: unknown;
  currency?: unknown;
  exchangeName?: unknown;
  regularMarketTime?: unknown;
};

type YahooChartPayload = {
  chart?: {
    result?: Array<{
      meta?: YahooChartMeta;
    }> | null;
    error?: {
      code?: unknown;
      description?: unknown;
    } | null;
  } | null;
};

const toNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const toStringOrNull = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : null;

const buildUnavailableItem = (
  base: Omit<FocusReportItem, "isAvailable">,
  error?: string | null,
): FocusReportItem => ({
  ...base,
  isAvailable: false,
  error: error ?? null,
});

const normalizeItem = (
  item: (typeof FOCUS_REPORT_MARKETS)[number],
  meta?: YahooChartMeta,
  error?: string | null,
): FocusReportItem => {
  const baseItem = {
    symbol: item.symbol,
    displaySymbol: item.displaySymbol,
    fallbackName: item.fallbackName,
    group: item.group,
    shortName: toStringOrNull(meta?.shortName),
    longName: toStringOrNull(meta?.longName),
    instrumentType: toStringOrNull(meta?.instrumentType),
    regularMarketPrice: toNumber(meta?.regularMarketPrice),
    previousClose:
      toNumber(meta?.previousClose) ?? toNumber(meta?.chartPreviousClose),
    priceHint: toNumber(meta?.priceHint),
    currency: toStringOrNull(meta?.currency),
    exchangeName: toStringOrNull(meta?.exchangeName),
    marketTime: toNumber(meta?.regularMarketTime) ?? null,
    error: error ?? null,
  };

  if (baseItem.regularMarketPrice === undefined) {
    return buildUnavailableItem(baseItem, error ?? "price_unavailable");
  }

  const change =
    baseItem.previousClose !== undefined
      ? baseItem.regularMarketPrice - baseItem.previousClose
      : undefined;
  const changePercent =
    change !== undefined &&
    baseItem.previousClose !== undefined &&
    baseItem.previousClose !== 0
      ? (change / baseItem.previousClose) * 100
      : undefined;

  return {
    ...baseItem,
    change,
    changePercent,
    isAvailable: true,
  };
};

const fetchFocusReportItem = async (
  item: (typeof FOCUS_REPORT_MARKETS)[number],
) => {
  try {
    const response = await fetchWithTimeout(
      `${YAHOO_CHART_BASE_URL}/${encodeURIComponent(item.symbol)}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36",
        },
      },
      8_000,
    );

    const payload = (await response.json().catch(() => null)) as
      | YahooChartPayload
      | null;

    if (!response.ok) {
      return normalizeItem(item, undefined, `upstream_${response.status}`);
    }

    const meta = payload?.chart?.result?.[0]?.meta;
    const yahooError = toStringOrNull(payload?.chart?.error?.description);

    if (!meta) {
      return normalizeItem(item, undefined, yahooError ?? "meta_unavailable");
    }

    return normalizeItem(item, meta, yahooError);
  } catch (error: unknown) {
    return normalizeItem(
      item,
      undefined,
      error instanceof Error ? error.message : "upstream_unreachable",
    );
  }
};

export async function GET() {
  const items = await Promise.all(FOCUS_REPORT_MARKETS.map(fetchFocusReportItem));

  return NextResponse.json(
    {
      status: "success",
      fetchedAt: new Date().toISOString(),
      total: items.length,
      data: items,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
