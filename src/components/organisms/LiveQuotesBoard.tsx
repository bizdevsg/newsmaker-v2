"use client";

import React from "react";
import { useLoading } from "../providers/LoadingProvider";
import type { Messages } from "@/locales";

type LiveQuotesBoardProps = {
  messages: Messages;
  title: string;
  subtitle?: string;
  limit?: number;
};

type MarketGroup = "index" | "equity";

type MarketDefinition = {
  symbol: string;
  displaySymbol: string;
  fallbackName: string;
  group: MarketGroup;
};

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

type MarketPollingItem = {
  symbol?: string;
  shortName?: string;
  price?: number;
  change?: number;
  change_percent?: number;
};

type MarketPollingResponse = {
  type?: "market";
  transport?: string;
  interval_ms?: number;
  at?: string;
  data?: MarketPollingItem[];
};

const MARKET_POLLING_URL = "/api/market";
const DEFAULT_POLL_INTERVAL_MS = 5_000;

const normalizeSymbol = (value?: string) => value?.trim().toUpperCase() ?? "";

const formatDisplaySymbol = (symbol: string) =>
  symbol.replace(/^\^/, "").replace(/\.JK$/i, "");

const resolveShortName = (value?: string) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
};

const resolveMarketGroup = (
  symbol: string,
): MarketGroup =>
  symbol.startsWith("^") || /^IDX\d+/i.test(symbol) ? "index" : "equity";

const mergeMarketsWithApiItems = (
  items: MarketPollingItem[],
) => {
  const marketMap = new Map<string, MarketDefinition>();

  items.forEach((item) => {
    const symbol = normalizeSymbol(item.symbol);
    if (!symbol) {
      return;
    }

    const dedupeKey = formatDisplaySymbol(symbol);
    if (marketMap.has(dedupeKey)) {
      return;
    }

    marketMap.set(dedupeKey, {
      symbol,
      displaySymbol: dedupeKey,
      fallbackName: resolveShortName(item.shortName) ?? dedupeKey,
      group: resolveMarketGroup(symbol),
    });
  });

  return Array.from(marketMap.values());
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

const resolveDigits = (group: DisplayMetric["group"], value?: number) => {
  if (
    group === "equity" &&
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return 0;
  }

  if (value === undefined) return 2;
  if (Math.abs(value) >= 1_000) return 0;
  if (Math.abs(value) >= 1) return 2;
  return 4;
};

const buildMetrics = (
  markets: MarketDefinition[],
  items?: MarketPollingItem[],
): DisplayMetric[] => {
  const itemMap = new Map(
    Array.isArray(items)
      ? items
          .filter(
            (item): item is MarketPollingItem & { symbol: string } =>
              typeof item.symbol === "string" && item.symbol.length > 0,
          )
          .map((item) => [normalizeSymbol(item.symbol), item] as const)
      : [],
  );

  return markets.map((market) => {
    const item =
      itemMap.get(normalizeSymbol(market.symbol)) ??
      itemMap.get(market.displaySymbol) ??
      itemMap.get(`${market.displaySymbol}.JK`) ??
      itemMap.get(`^${market.displaySymbol}`);
    const digits = resolveDigits(market.group, item?.price);
    const changeParts = [
      formatSignedNumber(item?.change, digits),
      item?.change_percent !== undefined
        ? `(${formatSignedNumber(item.change_percent, 2)}%)`
        : undefined,
    ].filter((value): value is string => Boolean(value));
    const subtitle =
      resolveShortName(item?.shortName) ??
      market.fallbackName ??
      market.displaySymbol;

    const tone =
      item?.change !== undefined
        ? item.change < 0
          ? "down"
          : item.change > 0
            ? "up"
            : "flat"
        : "flat";

    return {
      key: market.symbol,
      label: market.displaySymbol,
      subtitle,
      badge: market.displaySymbol,
      group: market.group,
      value: formatNumber(item?.price, digits) ?? "-",
      tone,
      meta: item ? changeParts.join(" ") || "No change" : "Unavailable",
      isAvailable: Boolean(item),
    };
  });
};

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
  limit,
}: LiveQuotesBoardProps) {
  const { start, stop } = useLoading();
  const [items, setItems] = React.useState<MarketPollingItem[]>([]);
  const loadingTokenRef = React.useRef<symbol | null>(null);
  const pollTimeoutRef = React.useRef<number | null>(null);
  const pollIntervalRef = React.useRef(DEFAULT_POLL_INTERVAL_MS);
  const displayMarkets = React.useMemo(() => {
    const mergedMarkets = mergeMarketsWithApiItems(items);
    return typeof limit === "number"
      ? mergedMarkets.slice(0, limit)
      : mergedMarkets;
  }, [items, limit]);

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

        void loadMarket();
      }, delay);
    };

    const loadMarket = async () => {
      if (!isMounted) {
        return;
      }

      try {
        const response = await fetch(MARKET_POLLING_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("market_poll_failed");
        }

        const payload = (await response.json()) as MarketPollingResponse;

        if (
          payload.type !== "market" ||
          !Array.isArray(payload.data) ||
          !isMounted
        ) {
          throw new Error("market_poll_invalid_payload");
        }

        if (
          typeof payload.interval_ms === "number" &&
          Number.isFinite(payload.interval_ms) &&
          payload.interval_ms > 0
        ) {
          pollIntervalRef.current = payload.interval_ms;
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
      void loadMarket();
    };

    loadingTokenRef.current = start("live-quotes");
    void loadMarket();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      finishInitialLoading();
      clearPollTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [start, stop]);

  const metrics = React.useMemo(
    () => buildMetrics(displayMarkets, items),
    [displayMarkets, items],
  );

  return (
    <div className="rounded-2xl">
      {/* <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">
            {messages.policy.biRatePage.updatedLabel}:{" "}
            {updatedTime || "--:--:--"}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${feedStatusClass}`}
        >
          <span className={`h-2 w-2 rounded-full ${feedStatusDotClass}`} />
          {feedStatusLabel}
        </span>
      </div> */}

      <ul className="grid gap-2">
        {metrics.map((metric) => {
          const toneClass =
            metric.tone === "up"
              ? "text-emerald-600"
              : metric.tone === "down"
                ? "text-rose-600"
                : "text-slate-500";
          const badgeClass =
            metric.group === "index"
              ? "bg-blue-100 text-blue-700 ring-blue-200"
              : "bg-emerald-100 text-emerald-700 ring-emerald-200";
          const surfaceClass = !metric.isAvailable
            ? "border-slate-200 bg-white"
            : metric.tone === "up"
              ? "border-emerald-100 bg-emerald-50/40"
              : metric.tone === "down"
                ? "border-rose-100 bg-rose-50/40"
                : "border-slate-200 bg-white";
          const typeClass =
            metric.group === "index"
              ? "bg-blue-50 text-blue-700"
              : "bg-emerald-50 text-emerald-700";
          const stateClass = !metric.isAvailable
            ? "bg-slate-100 text-slate-500"
            : metric.tone === "up"
              ? "bg-emerald-50 text-emerald-700"
              : metric.tone === "down"
                ? "bg-rose-50 text-rose-700"
                : "bg-slate-100 text-slate-600";

          return (
            <li
              key={metric.key}
              className={`rounded-xl border px-3 py-3 transition-colors ${surfaceClass}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-[11px] font-bold tracking-[0.16em] ring-1 ${badgeClass}`}
                  >
                    {metric.badge}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {metric.label}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${typeClass}`}
                      >
                        {metric.group}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {metric.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-1 sm:min-w-44 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${toneClass}`}>
                      {metric.meta}
                    </p>

                    <p className="text-base font-semibold text-slate-900">
                      {metric.value}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${stateClass}`}
                    >
                      {getMetricStateLabel(metric)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
