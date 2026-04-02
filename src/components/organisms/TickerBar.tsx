"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useLoading } from "../providers/LoadingProvider";
import {
  isIndonesiaMarketAnalysisArticle,
  isIndonesiaMarketNewsArticle,
} from "@/lib/indonesia-market-sections";
import { resolvePortalNewsTitle } from "@/lib/portalnews-shared";

type TickerBarProps = {
  topNews?: string;
};

type LiveTick = {
  key: string;
  symbol?: string;
  priceText: string;
  href?: string;
};

type NewsItem = {
  id: number;
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
};

type MarketApiItem = {
  symbol?: string;
  shortName?: string;
  price?: number;
  change?: number;
  change_percent?: number;
};

type MarketApiResponse = {
  type?: string;
  transport?: string;
  interval_ms?: number;
  at?: string;
  data?: MarketApiItem[];
};

const MARKET_API_URL = "/api/market";
const NEWS_API_URL = `/api/portalnews?limit=24`;
const MARKET_REFRESH_INTERVAL_MS = 1000;
const NEWS_REFRESH_INTERVAL_MS = 300_000;
const MARKET_TICK_LIMIT = 10;
const NEWS_TICK_LIMIT = 8;

const MARKET_SYMBOL_LABELS = new Map<string, string>([
  ["^JKSE", "IHSG"],
  ["^JKLQ45", "LQ45"],
]);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value);

const resolveTickerSymbol = (symbol: string, shortName?: string) => {
  const predefinedLabel = MARKET_SYMBOL_LABELS.get(symbol);
  if (predefinedLabel) {
    return predefinedLabel;
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

export function TickerBar({ topNews = "Trending" }: TickerBarProps) {
  const { start, stop } = useLoading();
  const { locale } = useParams<{ locale?: string }>();
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
      return {
        key: `${item.symbol}-${item.price}-${item.change ?? 0}`,
        symbol: resolveTickerSymbol(item.symbol, item.shortName),
        priceText,
      };
    };

    const toNewsTick = (item: NewsItem): LiveTick => ({
      key: `news-${item.id}`,
      priceText: resolvePortalNewsTitle(item, locale, "Latest update"),
    });

    const isAllowedNewsItem = (item: NewsItem) =>
      isIndonesiaMarketNewsArticle(item) ||
      isIndonesiaMarketAnalysisArticle(item);

    const loadMarket = async () => {
      if (isFetchingMarket) {
        return;
      }

      isFetchingMarket = true;

      try {
        const payload = await fetchJson<MarketApiResponse>(MARKET_API_URL);
        if (!isActive) return;

        const nextTicks = Array.isArray(payload?.data)
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
          .filter(isAllowedNewsItem)
          .slice(0, NEWS_TICK_LIMIT)
          .map(toNewsTick);
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
  }, [locale, start, stop]);

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
    const wrapperClass =
      "inline-flex items-center gap-2 transition-colors hover:text-white";
    const content = item.symbol ? (
      <>
        <span className={symbolClass}>{item.symbol}</span>
        <span className="text-white/80">{item.priceText}</span>
      </>
    ) : (
      <span className="text-white/85">{item.priceText}</span>
    );

    if (item.href) {
      return (
        <span
          key={`${item.key}-${variant}-${index}`}
          className="inline-flex items-center gap-2"
        >
          <Link
            href={item.href}
            className={`${wrapperClass} hover:underline`}
            aria-label={`Buka berita: ${item.priceText}`}
          >
            {content}
          </Link>
          {nextIsTick ? (
            <span className="ticker-dot" aria-hidden="true">
              &bull;
            </span>
          ) : null}
        </span>
      );
    }

    return (
      <span
        key={`${item.key}-${variant}-${index}`}
        className="inline-flex items-center gap-2"
      >
        <span className={wrapperClass}>{content}</span>
        {nextIsTick ? (
          <span className="ticker-dot" aria-hidden="true">
            &bull;
          </span>
        ) : null}
      </span>
    );
  };

  return (
    <div className="flex justify-center overflow-x-clip bg-[#1061B3]">
      <div className="ticker-wrapper flex w-full min-w-0 max-w-7xl items-center gap-4 overflow-hidden py-2 text-[11px] font-medium text-white shadow-lg sm:text-xs">
        {/* Top News / Label */}
        <div className=" absolute bg-linear-to-r from-[#1061B3] my-2 z-10">
          <div className="flex shrink-0 items-center ml-2 gap-2 rounded-l-full bg-linear-to-r from-white via-white/80 p-0.5 pr-16">
            <p className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
              <i className="fa-solid fa-bolt text-[10px]" aria-hidden="true" />
            </p>

            <p className="text-[10px] text-nowrap font-bold uppercase tracking-[0.2em] text-red-800 sm:text-[11px]">
              {topNews}
            </p>
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
