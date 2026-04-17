"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useLoading } from "../providers/LoadingProvider";
import { resolvePortalNewsTitle } from "@/lib/portalnews-shared";
import { buildMarketNewsDetailHrefForItem } from "@/lib/news-routing";
import type { Locale } from "@/locales";

type TickerBarProps = {
  locale?: Locale;
  topNews?: string;
};

type LiveTick = {
  key: string;
  symbol?: string;
  priceText: string;
  changePercentText?: string;
  tone?: "up" | "down" | "flat";
  href?: string;
};

type NewsItem = {
  id?: number | string;
  type?: string;
  title?: string;
  titles?: {
    default?: string;
  };
  slug?: string;
  created_at?: string;
  kategori?: {
    name?: string;
    slug?: string;
  };
  main_category?: {
    name?: string;
    slug?: string;
  };
  sub_category?: {
    name?: string;
    slug?: string;
  };
};

type MarketApiItem = {
  symbol?: string;
  price?: number;
  valueChange?: number;
  percentChange?: number;
};

type MarketApiResponse = {
  status?: string;
  updatedAt?: string;
  serverTime?: string;
  total?: number;
  data?: MarketApiItem[];
  source?: string;
  state?: string;
  error?: unknown;
};

const MARKET_API_URL = "/api/live-quotes";
const NEWS_API_URL = `/api/ticker-news`;
const MARKET_REFRESH_INTERVAL_MS = 1000;
const NEWS_REFRESH_INTERVAL_MS = 300_000;
const MARKET_TICK_LIMIT = 10;
const NEWS_TICK_LIMIT = 5;

const MARKET_SYMBOL_LABELS = new Map<string, string>([
  ["^JKSE", "IHSG"],
  ["^JKLQ45", "LQ45"],
  ["XUL10", "Gold"],
  ["XAUUSD", "Gold"],
  ["XAGUSD", "Silver"],
  ["BCO10_BBJ", "Brent"],
  ["UKOIL", "Brent"],
  ["HKK50_BBJ", "Hang Seng"],
  ["HSI", "Hang Seng"],
  ["JPK50_BBJ", "Nikkei"],
  ["NIKKEI", "Nikkei"],
  ["EU10F_BBJ", "EUR/USD"],
  ["UJ10F_BBJ", "USD/JPY"],
  ["UC10F_BBJ", "USD/CHF"],
  ["AU10F_BBJ", "AUD/USD"],
  ["GU10F_BBJ", "GBP/USD"],
]);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value);

const formatSignedPercent = (value: number) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;
};

const resolveTickerSymbol = (symbol: string, shortName?: string) => {
  const predefinedLabel = MARKET_SYMBOL_LABELS.get(symbol);
  if (predefinedLabel) {
    return predefinedLabel;
  }

  if (symbol.includes("XAG")) {
    return "Silver";
  }

  if (symbol.includes("XAU") || symbol.includes("XUL")) {
    return "Gold";
  }

  const formattedSymbol = symbol.replace(/^\^/, "").replace(/\.JK$/i, "");
  if (formattedSymbol) {
    return formattedSymbol;
  }

  if (typeof shortName === "string" && shortName.trim()) {
    return shortName.trim();
  }

  return symbol;
};

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export function TickerBar({
  locale: localeProp,
  topNews = "Trending",
}: TickerBarProps) {
  const { start, stop } = useLoading();
  const params = useParams();
  const rawLocale = params?.locale;
  const localeParam = Array.isArray(rawLocale) ? rawLocale[0] : rawLocale;
  const resolvedLocale =
    localeProp === "en" ? "en" : localeParam === "en" ? "en" : "id";
  const [liveTicks, setLiveTicks] = useState<LiveTick[]>([]);
  const [newsTicks, setNewsTicks] = useState<LiveTick[]>([]);

  useEffect(() => {
    let isActive = true;
    let initialMarketSettled = false;
    let initialNewsSettled = false;
    let isFetchingMarket = false;
    let loadingToken: symbol | null = start("ticker-bar");

    const finishInitialLoading = () => {
      if (!loadingToken || !initialMarketSettled || !initialNewsSettled) {
        return;
      }

      stop(loadingToken);
      loadingToken = null;
    };

    const settleMarket = () => {
      if (initialMarketSettled) {
        return;
      }

      initialMarketSettled = true;
      finishInitialLoading();
    };

    const settleNews = () => {
      if (initialNewsSettled) {
        return;
      }

      initialNewsSettled = true;
      finishInitialLoading();
    };

    const toTick = (item: MarketApiItem): LiveTick | null => {
      if (typeof item.symbol !== "string" || !item.symbol) {
        return null;
      }

      if (typeof item.price !== "number" || !Number.isFinite(item.price)) {
        return null;
      }

      const priceText = formatNumber(item.price);
      const changePercentText =
        typeof item.percentChange === "number" &&
        Number.isFinite(item.percentChange)
          ? formatSignedPercent(item.percentChange)
          : undefined;
      const tone =
        typeof item.percentChange === "number" &&
        Number.isFinite(item.percentChange)
          ? item.percentChange > 0
            ? "up"
            : item.percentChange < 0
              ? "down"
              : "flat"
          : typeof item.valueChange === "number" &&
              Number.isFinite(item.valueChange)
            ? item.valueChange > 0
              ? "up"
              : item.valueChange < 0
                ? "down"
                : "flat"
          : "flat";
      return {
        key: `${item.symbol}-${item.price}-${item.valueChange ?? 0}`,
        symbol: resolveTickerSymbol(item.symbol),
        priceText,
        changePercentText,
        tone,
      };
    };

    const toNewsTick = (item: NewsItem, index: number): LiveTick => {
      const slug = item.slug?.trim();
      const href = buildMarketNewsDetailHrefForItem(
        resolvedLocale,
        item as Parameters<typeof buildMarketNewsDetailHrefForItem>[1],
      );

      return {
        key: `news-${item.id ?? slug ?? index}`,
        priceText: resolvePortalNewsTitle(
          item,
          resolvedLocale,
          "Latest update",
        ),
        href: href ?? undefined,
      };
    };

    const loadMarket = async () => {
      if (isFetchingMarket) {
        return;
      }

      isFetchingMarket = true;

      try {
        const payload = await fetchJson<MarketApiResponse>(MARKET_API_URL);
        if (!isActive) return;

        const nextTicks =
          payload?.status === "success" && Array.isArray(payload?.data)
            ? payload.data
                .map(toTick)
                .filter((item): item is LiveTick => item !== null)
                .slice(0, MARKET_TICK_LIMIT)
            : [];

        if (nextTicks.length) {
          setLiveTicks(nextTicks);
        }
      } finally {
        isFetchingMarket = false;
        settleMarket();
      }
    };

    const loadNews = async () => {
      try {
        const response = await fetch(NEWS_API_URL, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (!isActive || payload?.status !== "success") return;
        const items = Array.isArray(payload.data) ? payload.data : [];
        const nextNews = items
          .slice(0, NEWS_TICK_LIMIT)
          .map((item: NewsItem, index: number) => toNewsTick(item, index));
        if (nextNews.length) {
          setNewsTicks(nextNews);
        }
      } catch {
        // keep previous news ticks
      } finally {
        settleNews();
      }
    };

    void loadMarket();
    void loadNews();
    const marketInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadMarket();
      }
    }, MARKET_REFRESH_INTERVAL_MS);
    const newsInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadNews();
      }
    }, NEWS_REFRESH_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(marketInterval);
      window.clearInterval(newsInterval);
      if (loadingToken) {
        stop(loadingToken);
      }
    };
  }, [resolvedLocale, start, stop]);

  const tickStream = useMemo(() => {
    const group: Array<
      { type: "tick"; item: LiveTick } | { type: "pipe"; key: string }
    > = [];

    liveTicks.forEach((item) => group.push({ type: "tick", item }));
    if (liveTicks.length && newsTicks.length) {
      group.push({ type: "pipe", key: "pipe-live-news" });
    }
    newsTicks.forEach((item) => group.push({ type: "tick", item }));
    if (liveTicks.length && newsTicks.length) {
      group.push({ type: "pipe", key: "pipe-news-live" });
    }

    return [...group, ...group, ...group];
  }, [liveTicks, newsTicks]);

  const renderTick = (
    item: LiveTick,
    index: number,
    nextIsTick: boolean,
    variant: "primary" | "secondary",
  ) => {
    const isPrimary = variant === "primary";
    const symbolClass = isPrimary ? "text-white" : "text-white/85";
    const priceClass = item.symbol
      ? item.tone === "up"
        ? isPrimary
          ? "text-emerald-300"
          : "text-emerald-200/90"
        : item.tone === "down"
          ? isPrimary
            ? "text-rose-300"
            : "text-rose-200/90"
          : "text-white/80"
      : "text-white/85";
    const wrapperClass =
      "inline-flex items-center gap-2 transition-colors hover:text-white";
    const content = item.symbol ? (
      <>
        <span className={symbolClass}>{item.symbol}</span>
        <span className={priceClass}>{item.priceText}</span>
        {item.changePercentText ? (
          <span className={priceClass}>({item.changePercentText})</span>
        ) : null}
      </>
    ) : (
      <span className={priceClass}>{item.priceText}</span>
    );

    return (
      <span
        key={`${item.key}-${variant}-${index}`}
        className="inline-flex items-center gap-2"
      >
        {item.href ? (
          <Link href={item.href} className={wrapperClass}>
            {content}
          </Link>
        ) : (
          <span className={wrapperClass}>{content}</span>
        )}
        {nextIsTick ? (
          <span className="ticker-dot" aria-hidden="true">
            &bull;
          </span>
        ) : null}
      </span>
    );
  };

  return (
    <div className="flex justify-center overflow-x-clip pl-4 bg-[#1061B3]">
      <div className="ticker-wrapper flex w-full min-w-0 max-w-7xl items-center gap-4 overflow-hidden py-2 text-[11px] font-medium text-white shadow-lg sm:text-xs">
        {/* Top News / Label */}
        <div className="absolute bg-linear-to-r from-[#1061B3] via-[#1061B3] my-2 z-10">
          <div className="flex items-center">
            <p className="text-[10px] text-nowrap font-bold uppercase tracking-[0.2em] text-whhite sm:text-[11px]">
              {topNews}
            </p>

            <div className="flex shrink-0 items-center ml-1 sm:ml-1 gap-2 rounded-l-full bg-linear-to-r from-white via-white/50 p-0.5 pr-10">
              <p className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
                {/* <i className="fa-solid fa-bolt-lightning text-[10px]"></i> */}
                <svg
                  width="140px"
                  height="140px"
                  viewBox="-2.4 -2.4 28.80 28.80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#ffffff"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="#CCCCCC"
                    strokeWidth="0.288"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      opacity="0.15"
                      d="M16 4H9L6 13H10L8 21L19 10H13.6L16 4Z"
                      fill="#ffffff"
                    ></path>{" "}
                    <path
                      d="M16 4H9L6 13H10L8 21L19 10H13.6L16 4Z"
                      stroke="#ffffff"
                      strokeWidth="0.9120000000000001"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                  </g>
                </svg>
              </p>
            </div>
          </div>
        </div>

        {/* Running Text / Ticker */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="ticker-track">
            <div className="ticker-row">
              {tickStream.map((entry, index) => {
                const next = tickStream[index + 1];
                if (entry.type === "pipe") {
                  return (
                    <span
                      key={`${entry.key}-${index}`}
                      className="ticker-sep text-white/50"
                      aria-hidden="true"
                    >
                      &bull;
                    </span>
                  );
                }

                return renderTick(
                  entry.item,
                  index,
                  next?.type === "tick",
                  "primary",
                );
              })}
            </div>
            <div className="ticker-row" aria-hidden="true">
              {tickStream.map((entry, index) => {
                const next = tickStream[index + 1];
                if (entry.type === "pipe") {
                  return (
                    <span
                      key={`${entry.key}-dup-${index}`}
                      className="ticker-sep text-white/40"
                      aria-hidden="true"
                    >
                      &bull;
                    </span>
                  );
                }

                return renderTick(
                  entry.item,
                  index,
                  next?.type === "tick",
                  "secondary",
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
