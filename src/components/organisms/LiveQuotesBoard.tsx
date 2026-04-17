"use client";

import React from "react";
import { useLoading } from "../providers/LoadingProvider";
import type { Messages } from "@/locales";
import { Card } from "../atoms/Card";
import { SectionHeader } from "../molecules/SectionHeader";

type LiveQuotesBoardProps = {
  messages: Messages;
  locale?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
};

type MarketGroup = "index" | "equity";

type DisplayMetric = {
  key: string;
  label: string;
  subtitle: string;
  badge: string;
  group: MarketGroup;
  value: string;
  tone: "up" | "down" | "flat";
  meta: string;
  isAvailable: boolean;
};

type LiveQuoteItem = {
  symbol?: string;
  price?: number;
  valueChange?: number;
  percentChange?: number;
  serverTime?: string;
  serverDateTime?: string;
  time?: string;
  date_time?: string;
};

type LiveQuotesResponse = {
  status?: string;
  updatedAt?: string;
  serverTime?: string;
  total?: number;
  data?: LiveQuoteItem[];
  source?: string;
  state?: string;
  error?: unknown;
};

const LIVE_QUOTES_URL = "/api/live-quotes";
const DEFAULT_POLL_INTERVAL_MS = 5_000;

const normalizeSymbol = (value?: string) => value?.trim().toUpperCase() ?? "";

type QuoteCategory = "futures" | "forex";

const FOREX_SYMBOL_MAP = new Map<
  string,
  { label: string; subtitle: string; badge: string; color: string }
>([
  [
    "EU10F_BBJ",
    { label: "EUR/USD", subtitle: "EURUSD", badge: "FX", color: "bg-blue-600" },
  ],
  [
    "UJ10F_BBJ",
    { label: "USD/JPY", subtitle: "USDJPY", badge: "FX", color: "bg-blue-600" },
  ],
  [
    "UC10F_BBJ",
    { label: "USD/CHF", subtitle: "USDCHF", badge: "FX", color: "bg-blue-600" },
  ],
  [
    "AU10F_BBJ",
    { label: "AUD/USD", subtitle: "AUDUSD", badge: "FX", color: "bg-blue-600" },
  ],
  [
    "GU10F_BBJ",
    { label: "GBP/USD", subtitle: "GBPUSD", badge: "FX", color: "bg-blue-600" },
  ],
]);

const FUTURES_SYMBOL_MAP = new Map<
  string,
  { label: string; subtitle: string; badge: string; color: string }
>([
  [
    "XUL10",
    {
      label: "Gold",
      subtitle: "XAUUSD",
      badge: "GOLD",
      color: "bg-amber-500",
    },
  ],
  [
    "XAGUSD",
    {
      label: "Silver",
      subtitle: "XAGUSD",
      badge: "SILV",
      color: "bg-slate-500",
    },
  ],
  [
    "BCO10_BBJ",
    { label: "Brent", subtitle: "BRENT", badge: "OIL", color: "bg-slate-900" },
  ],
  [
    "HKK50_BBJ",
    {
      label: "Hang Seng",
      subtitle: "HSI",
      badge: "IDX",
      color: "bg-rose-600",
    },
  ],
  [
    "JPK50_BBJ",
    {
      label: "Nikkei",
      subtitle: "NIKKEI",
      badge: "IDX",
      color: "bg-indigo-700",
    },
  ],
]);

const resolveQuoteCategory = (symbol: string): QuoteCategory => {
  if (FOREX_SYMBOL_MAP.has(symbol)) return "forex";
  if (symbol.endsWith("F_BBJ")) return "forex";
  return "futures";
};

const resolveSymbolPreset = (symbol: string) => {
  const direct = FOREX_SYMBOL_MAP.get(symbol) ?? FUTURES_SYMBOL_MAP.get(symbol);
  if (direct) return direct;

  if (symbol.includes("XAG")) {
    return {
      label: "Silver",
      subtitle: "XAGUSD",
      badge: "SILV",
      color: "bg-slate-500",
    };
  }

  if (symbol.includes("XAU") || symbol.includes("XUL")) {
    return {
      label: "Gold",
      subtitle: "XAUUSD",
      badge: "GOLD",
      color: "bg-amber-500",
    };
  }

  if (symbol === "BCO10_BBJ" || symbol === "UKOIL" || symbol.includes("BRENT")) {
    return {
      label: "Brent",
      subtitle: "BRENT",
      badge: "OIL",
      color: "bg-slate-900",
    };
  }

  if (symbol === "HKK50_BBJ" || symbol === "HSI" || symbol.includes("HANGSENG")) {
    return {
      label: "Hang Seng",
      subtitle: "HSI",
      badge: "IDX",
      color: "bg-rose-600",
    };
  }

  if (symbol === "JPK50_BBJ" || symbol === "NIKKEI" || symbol.includes("NIKKEI")) {
    return {
      label: "Nikkei",
      subtitle: "NIKKEI",
      badge: "IDX",
      color: "bg-indigo-700",
    };
  }

  return undefined;
};

const ICONS = {
  gold: "/assets/gold-icon.png",
  silver: "/assets/silver-icon.png",
  hsi: "/assets/hsi-icon.png",
  nikkei: "/assets/nikkei-icon.png",
  oil: "/assets/oil-icon.png",
  forex: "/assets/forex-icon.png",
  dollar: "/assets/dollar-icon.png",
} as const;

const resolveIconSrc = (
  symbol: string,
  category: QuoteCategory,
  mappedLabel?: string,
) => {
  if (symbol === "XUL10" || symbol.includes("XAU") || symbol.includes("XUL"))
    return ICONS.gold;
  if (symbol.includes("XAG") || mappedLabel === "XAGUSD") return ICONS.silver;
  if (symbol === "BCO10_BBJ" || mappedLabel === "UKOIL") return ICONS.oil;
  if (symbol === "HKK50_BBJ" || mappedLabel === "HSI") return ICONS.hsi;
  if (symbol === "JPK50_BBJ" || mappedLabel === "NIKKEI") return ICONS.nikkei;
  if (symbol.includes("DOLLAR") || mappedLabel === "US Dollar")
    return ICONS.dollar;
  if (category === "forex") return ICONS.forex;
  return null;
};

const formatNumber = (value: number | undefined, digits = 2) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

const formatSignedNumber = (value: number | undefined, digits = 2) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, digits)}`;
};

const resolveDigits = (value?: number) => {
  if (value === undefined) return 2;
  if (Math.abs(value) >= 1_000) return 0;
  if (Math.abs(value) >= 1) return 2;
  return 4;
};

const resolveMarketGroup = (symbol: string): MarketGroup => {
  if (/K50/i.test(symbol) || /^IDX\d+/i.test(symbol) || /^XUL/i.test(symbol)) {
    return "index";
  }
  return "equity";
};

const resolveTone = (item: LiveQuoteItem): DisplayMetric["tone"] => {
  const percent = item.percentChange;
  if (typeof percent === "number" && Number.isFinite(percent)) {
    if (percent > 0) return "up";
    if (percent < 0) return "down";
    return "flat";
  }

  const absolute = item.valueChange;
  if (typeof absolute === "number" && Number.isFinite(absolute)) {
    if (absolute > 0) return "up";
    if (absolute < 0) return "down";
    return "flat";
  }

  return "flat";
};

const buildMetrics = (items: LiveQuoteItem[]): DisplayMetric[] =>
  items
    .filter(
      (item): item is LiveQuoteItem & { symbol: string } =>
        typeof item.symbol === "string" && item.symbol.trim().length > 0,
    )
    .map((item) => {
      const symbol = normalizeSymbol(item.symbol);
      const digits = resolveDigits(item.price);
      const changeParts = [
        formatSignedNumber(item.valueChange, digits),
        item.percentChange !== undefined
          ? `(${formatSignedNumber(item.percentChange, 2)}%)`
          : undefined,
      ].filter((value): value is string => Boolean(value));

      const tone = resolveTone(item);

      const subtitle =
        String(item.serverTime ?? item.time ?? "").trim() ||
        String(item.serverDateTime ?? item.date_time ?? "").trim() ||
        "Live";

      return {
        key: symbol,
        label: symbol,
        subtitle,
        badge: symbol,
        group: resolveMarketGroup(symbol),
        value: formatNumber(item.price, digits) ?? "-",
        tone,
        meta: changeParts.join(" ") || "No change",
        isAvailable: item.price !== undefined,
      };
    });

const getMetricStateLabel = (metric: DisplayMetric) => {
  if (!metric.isAvailable) return "Waiting";

  switch (metric.tone) {
    case "up":
      return "Up";
    case "down":
      return "Down";
    default:
      return "Flat";
  }
};

export function LiveQuotesBoard({
  title,
  subtitle,
  limit,
}: LiveQuotesBoardProps) {
  const { start, stop } = useLoading();
  const [items, setItems] = React.useState<LiveQuoteItem[]>([]);
  const [activeCategory, setActiveCategory] =
    React.useState<QuoteCategory>("futures");
  const loadingTokenRef = React.useRef<symbol | null>(null);
  const pollTimeoutRef = React.useRef<number | null>(null);
  const pollIntervalRef = React.useRef(DEFAULT_POLL_INTERVAL_MS);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollByCards = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.max(240, Math.round(el.clientWidth * 0.85)) * direction;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  React.useEffect(() => {
    let isMounted = true;

    const finishInitialLoading = () => {
      if (!loadingTokenRef.current) {
        return;
      }

      stop(loadingTokenRef.current);
      loadingTokenRef.current = null;
    };

    const clearPollTimer = () => {
      if (pollTimeoutRef.current !== null) {
        window.clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };

    const scheduleNextPoll = (delay = pollIntervalRef.current) => {
      clearPollTimer();
      if (!isMounted) {
        return;
      }

      pollTimeoutRef.current = window.setTimeout(() => {
        if (document.visibilityState !== "visible") {
          scheduleNextPoll(delay);
          return;
        }

        void loadQuotes();
      }, delay);
    };

    const loadQuotes = async () => {
      if (!isMounted) {
        return;
      }

      try {
        const response = await fetch(LIVE_QUOTES_URL, {
          cache: "no-store",
        });

        if (!response.ok) throw new Error("live_quotes_fetch_failed");

        const payload = (await response.json()) as LiveQuotesResponse;

        if (
          payload.status !== "success" ||
          !Array.isArray(payload.data) ||
          !isMounted
        ) {
          throw new Error("live_quotes_invalid_payload");
        }

        setItems(payload.data);
      } catch {
        if (!isMounted) {
          return;
        }
      } finally {
        finishInitialLoading();
        scheduleNextPoll();
      }
    };

    const handleVisibilityChange = () => {
      if (!isMounted || document.visibilityState !== "visible") {
        return;
      }

      clearPollTimer();
      void loadQuotes();
    };

    loadingTokenRef.current = start("live-quotes");
    void loadQuotes();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      finishInitialLoading();
      clearPollTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [start, stop]);

  const categoryItems = React.useMemo(() => {
    const filtered = items.filter((item) => {
      const symbol = normalizeSymbol(item.symbol);
      return resolveQuoteCategory(symbol) === activeCategory;
    });

    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }, [activeCategory, items, limit]);

  const metrics = React.useMemo(
    () => buildMetrics(categoryItems),
    [categoryItems],
  );

  const resolvedTitle = title?.trim() || "Live Quotes";
  const resolvedSubtitle = subtitle?.trim();

  return (
    <Card>
      <SectionHeader
        title={resolvedTitle}
        optional={resolvedSubtitle}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50"
              aria-label="Scroll left"
            >
              <i className="fa-solid fa-chevron-left text-[11px]" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50"
              aria-label="Scroll right"
            >
              <i className="fa-solid fa-chevron-right text-[11px]" />
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={() => setActiveCategory("futures")}
          className={`h-7 rounded-full px-4 text-xs font-semibold transition ${
            activeCategory === "futures"
              ? "bg-blue-700 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          Futures
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("forex")}
          className={`h-7 rounded-full px-4 text-xs font-semibold transition ${
            activeCategory === "forex"
              ? "bg-blue-700 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          Forex
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {metrics.map((metric) => {
          const toneClass =
            metric.tone === "up"
              ? "text-emerald-600"
              : metric.tone === "down"
                ? "text-rose-600"
                : "text-slate-500";

          const symbolKey = normalizeSymbol(metric.label);
          const mapped = resolveSymbolPreset(symbolKey);

          const label = mapped?.label ?? metric.label;
          const badgeText =
            mapped?.badge ?? (metric.group === "index" ? "IDX" : "MKT");
          const iconSrc = resolveIconSrc(
            symbolKey,
            activeCategory,
            mapped?.label,
          );
          const pillClass =
            metric.tone === "up"
              ? "bg-emerald-50 text-emerald-700"
              : metric.tone === "down"
                ? "bg-rose-50 text-rose-700"
                : "bg-slate-100 text-slate-600";

          return (
            <div
              key={metric.key}
              className="min-w-[300px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex h-full items-center gap-4">
                <div className="flex w-16 shrink-0 items-center justify-center self-stretch">
                  {iconSrc ? (
                    <img
                      src={iconSrc}
                      alt=""
                      className="h-16 w-16 object-contain"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="text-xs font-bold tracking-wide text-slate-700">
                      {badgeText}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-blue-900">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-bold leading-none text-slate-900">
                    {metric.value}
                  </p>
                  <p className={`mt-1 text-[10px] font-semibold ${toneClass}`}>
                    {metric.meta}
                  </p>
                </div>

                <span
                  className={`inline-flex h-6 items-center rounded-full px-3 text-[10px] font-bold uppercase tracking-[0.16em] ${pillClass}`}
                >
                  {getMetricStateLabel(metric)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
