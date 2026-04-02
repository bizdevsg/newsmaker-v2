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
  shortName: string;
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
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  price?: number;
  previous_close?: number;
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
const DEFAULT_POLL_INTERVAL_MS = 1_000;
const PAGE_SIZE = 24;

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

const buildSymbolVariants = (symbol: string) => {
  const normalizedSymbol = normalizeSymbol(symbol);
  if (!normalizedSymbol) {
    return [];
  }

  const baseSymbol = formatDisplaySymbol(normalizedSymbol);
  return Array.from(
    new Set([
      normalizedSymbol,
      baseSymbol,
      `${baseSymbol}.JK`,
      `^${baseSymbol}`,
    ]),
  );
};

const resolveMarketGroup = (symbol: string): MarketGroup =>
  symbol.startsWith("^") || /^IDX\d+/i.test(symbol) ? "index" : "equity";

const mergeMarketsWithApiItems = (items: MarketPollingItem[]) => {
  const apiOrderedMarkets: MarketDefinition[] = [];
  const seenSymbols = new Set<string>();

  items.forEach((item) => {
    const symbol = normalizeSymbol(item.symbol);
    if (!symbol) {
      return;
    }

    const dedupeSymbol = formatDisplaySymbol(symbol);
    if (seenSymbols.has(dedupeSymbol)) {
      return;
    }
    seenSymbols.add(dedupeSymbol);

    const nextMarket: MarketDefinition = {
      symbol,
      displaySymbol: dedupeSymbol,
      fallbackName: resolveShortName(item.shortName) ?? dedupeSymbol,
      group: resolveMarketGroup(symbol),
    };
    apiOrderedMarkets.push(nextMarket);
  });

  return apiOrderedMarkets;
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

const formatUpdatedTime = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
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
  const itemMap = new Map<string, MarketPollingItem>();
  if (Array.isArray(items)) {
    items
      .filter(
        (item): item is MarketPollingItem & { symbol: string } =>
          typeof item.symbol === "string" && item.symbol.length > 0,
      )
      .forEach((item) => {
        const symbol = normalizeSymbol(item.symbol);
        if (!symbol || itemMap.has(symbol)) {
          return;
        }
        itemMap.set(symbol, item);
      });
  }

  return markets.map((market) => {
    const item = buildSymbolVariants(market.symbol)
      .map((variantSymbol) => itemMap.get(variantSymbol))
      .find(
        (candidate): candidate is MarketPollingItem => candidate !== undefined,
      );
    const digits = resolveDigits(market.group, item?.price);
    const changeParts = [
      formatSignedNumber(item?.change, digits),
      item?.change_percent !== undefined
        ? `(${formatSignedNumber(item.change_percent, 2)}%)`
        : undefined,
    ].filter((value): value is string => Boolean(value));

    const tone =
      item?.change !== undefined
        ? item.change < 0
          ? "down"
          : item.change > 0
            ? "up"
            : "flat"
        : "flat";
    const shortName =
      resolveShortName(item?.shortName) ??
      market.fallbackName ??
      market.displaySymbol;

    return {
      key: market.symbol,
      label: market.displaySymbol,
      shortName,
      subtitle: shortName,
      badge: market.displaySymbol,
      group: market.group,
      value: formatNumber(item?.price, digits) ?? "-",
      tone,
      meta: item ? changeParts.join(" ") || "No change" : "Unavailable",
      isAvailable: Boolean(item),
    };
  });
};

const getFeedStatusLabel = (
  status: "connecting" | "live" | "reconnecting" | "offline",
) => {
  switch (status) {
    case "live":
      return "Live";
    case "reconnecting":
      return "Reconnecting";
    case "offline":
      return "Offline";
    default:
      return "Connecting";
  }
};

const getMetricToneStyles = (metric: DisplayMetric) => {
  if (!metric.isAvailable) {
    return {
      surfaceClass: "border-slate-200/80 bg-white/90",
      badgeClass: "bg-slate-100 text-slate-600 ring-slate-200",
      typeClass: "bg-slate-100 text-slate-600",
      stateClass: "bg-slate-100 text-slate-600",
      labelClass: "bg-slate-200 text-slate-600",
      sublabelClass: "bg-slate-100 text-slate-600",
      toneClass: "text-slate-500",
      barClass: "bg-slate-300",
      accentClass: "from-slate-300 to-slate-200",
      haloClass: "from-slate-200/60 to-transparent",
      stateLabel: "Waiting",
    };
  }

  if (metric.tone === "up") {
    return {
      surfaceClass: "border-emerald-200/70 bg-emerald-50/60",
      badgeClass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      typeClass: "bg-emerald-100 text-emerald-700",
      stateClass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      labelClass: "bg-emerald-200 text-emerald-700",
      sublabelClass: "bg-emerald-100 text-emerald-700",
      toneClass: "text-emerald-700",
      barClass: "bg-emerald-500",
      accentClass: "from-emerald-500 to-emerald-300",
      haloClass: "from-emerald-200/60 to-transparent",
      stateLabel: <i className="fa-solid fa-angles-up" aria-hidden="true" />,
    };
  }

  if (metric.tone === "down") {
    return {
      surfaceClass: "border-rose-200/70 bg-rose-50/60",
      badgeClass: "bg-rose-100 text-rose-700 ring-rose-200",
      typeClass: "bg-rose-100 text-rose-700",
      stateClass: "bg-rose-100 text-rose-700 ring-rose-200",
      labelClass: "bg-rose-200 text-rose-700",
      sublabelClass: "bg-rose-100 text-rose-700",
      toneClass: "text-rose-700",
      barClass: "bg-rose-500",
      accentClass: "from-rose-500 to-rose-300",
      haloClass: "from-rose-200/60 to-transparent",
      stateLabel: <i className="fa-solid fa-angles-down" aria-hidden="true" />,
    };
  }

  return {
    surfaceClass: "border-slate-200/80 bg-white/90",
    badgeClass: "bg-blue-100 text-blue-700 ring-blue-200",
    typeClass: "bg-blue-100 text-blue-700",
    stateClass: "bg-slate-100 text-slate-600 ring-blue-200",
    sublabelClass: "bg-slate-100 text-slate-600",
    toneClass: "text-slate-600",
    barClass: "bg-slate-500",
    accentClass: "from-blue-500 to-slate-400",
    haloClass: "from-blue-200/60 to-transparent",
    stateLabel: <i className="fa-solid fa-minus" aria-hidden="true" />,
  };
};

export function LiveQoutesBoardsCard({
  messages,
  title,
  subtitle,
  limit,
}: LiveQuotesBoardProps) {
  const { start, stop } = useLoading();
  const [items, setItems] = React.useState<MarketPollingItem[]>([]);
  const [updatedAt, setUpdatedAt] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [feedStatus, setFeedStatus] = React.useState<
    "connecting" | "live" | "reconnecting" | "offline"
  >("connecting");
  const loadingTokenRef = React.useRef<symbol | null>(null);
  const hasInitialMarketDataRef = React.useRef(false);
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

      if (!hasInitialMarketDataRef.current) {
        setFeedStatus("connecting");
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
        setUpdatedAt(payload.at ?? new Date().toISOString());
        setFeedStatus("live");
        hasInitialMarketDataRef.current = true;
      } catch {
        if (!isMounted) {
          return;
        }

        setFeedStatus(
          hasInitialMarketDataRef.current ? "reconnecting" : "offline",
        );
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
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredMetrics = React.useMemo(() => {
    if (!normalizedSearchQuery) {
      return metrics;
    }

    return metrics.filter((metric) =>
      [metric.label, metric.shortName, metric.subtitle].some((value) =>
        value.toLowerCase().includes(normalizedSearchQuery),
      ),
    );
  }, [metrics, normalizedSearchQuery]);
  const totalPages = Math.max(1, Math.ceil(filteredMetrics.length / PAGE_SIZE));
  const paginatedMetrics = React.useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredMetrics.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredMetrics]);
  const visiblePages = React.useMemo(() => {
    const windowSize = 5;
    const startPage = Math.max(
      1,
      Math.min(
        currentPage - Math.floor(windowSize / 2),
        totalPages - windowSize + 1,
      ),
    );
    const endPage = Math.min(totalPages, startPage + windowSize - 1);
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index,
    );
  }, [currentPage, totalPages]);
  const updatedTime = formatUpdatedTime(updatedAt);
  const feedStatusLabel = getFeedStatusLabel(feedStatus);
  const feedStatusClass =
    feedStatus === "live"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : feedStatus === "reconnecting"
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        : feedStatus === "offline"
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  const feedStatusDotClass =
    feedStatus === "live"
      ? "bg-emerald-500"
      : feedStatus === "reconnecting"
        ? "bg-amber-500"
        : feedStatus === "offline"
          ? "bg-rose-500"
          : "bg-slate-400";
  const updatedLabel = messages.policy.biRatePage.updatedLabel;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearchQuery]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-linear-to-br from-blue-200/70 to-transparent blur-3xl" />

      <div className="relative mb-4 rounded-xl border border-slate-200/80 bg-white/70 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="font-semibold uppercase text-slate-400">{title}</p>
            {/* {subtitle ? (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            ) : null}
            <p className="mt-1 text-xs text-slate-500">
              {updatedLabel}: {updatedTime || "--:--:--"}
            </p> */}
            <span
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${feedStatusClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${feedStatusDotClass}`} />
              {feedStatusLabel} - {filteredMetrics.length} items
            </span>
          </div>

          <div className="w-full max-w-lg">
            <label
              htmlFor="live-quotes-search"
              className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              Search
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
              <i
                className="fa-solid fa-magnifying-glass pointer-events-none text-slate-400"
                aria-hidden="true"
              />
              <input
                id="live-quotes-search"
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search symbol or company"
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      <ul className="relative grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {paginatedMetrics.map((metric) => {
          const {
            surfaceClass,
            badgeClass,
            typeClass,
            stateClass,
            labelClass,
            sublabelClass,
            toneClass,
            accentClass,
            haloClass,
            stateLabel,
          } = getMetricToneStyles(metric);
          const marketType = metric.group === "index" ? "Index" : "Equity";

          return (
            <li
              key={metric.key}
              className={`group relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${surfaceClass}`}
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accentClass}`}
              />
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-linear-to-br ${haloClass} blur-2xl`}
              />

              <div className="relative flex flex-col gap-4">
                <div className="flex flex-col items-center justify-between w-full">
                  <div className="min-w-0 w-full flex items-center justify-between">
                    <span
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg text-[11px] font-bold ring-1 ${badgeClass}`}
                    >
                      <i className="fa-solid fa-chart-simple"></i>
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${typeClass}`}
                    >
                      {marketType}
                    </span>

                    <span
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg text-[11px] font-bold ring-1 ${stateClass}`}
                    >
                      {stateLabel}
                    </span>
                  </div>

                  <div className="mt-2 w-full text-center space-y-1">
                    <div
                      className={`${labelClass} mx-auto py-0.5 px-10 rounded-full w-fit`}
                    >
                      <p className="text-sm font-semibold">{metric.label}</p>
                    </div>

                    <div
                      className={`py-0.5 px-5 mx-auto rounded-full w-fit ${sublabelClass}`}
                    >
                      <p className="text-xs">{metric.shortName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <span
                    className={`text-xl font-semibold tabular-nums ${toneClass}`}
                  >
                    {metric.value}
                  </span>
                  <p className={`text-sm font-semibold ${toneClass}`}>
                    {metric.meta}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {!paginatedMetrics.length ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-5 text-center text-sm text-slate-500">
          No matching symbols found.
        </p>
      ) : null}

      {filteredMetrics.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            Page {currentPage} of {totalPages} - {PAGE_SIZE} items per page
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            {visiblePages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`rounded-md border px-3 py-1 text-xs font-semibold transition ${
                  currentPage === page
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
