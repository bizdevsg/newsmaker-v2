"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { useLoading } from "../providers/LoadingProvider";

type TickerBarProps = {
  ticks?: string[];
  topNews?: string;
};

type LiveQuote = {
  symbol: string;
  price: number;
  percentChange: number;
  serverTime?: string;
};
type LiveTick = {
  key: string;
  symbol: string;
  priceText: string;
  percentText?: string;
  tone: "up" | "down" | "flat";
  href?: string;
};

type NewsItem = {
  id: number;
  title?: string;
  slug?: string;
  created_at?: string;
  kategori?: {
    name?: string;
    slug?: string;
  };
};

const ENDPOAPI_BASE = process.env.NEXT_PUBLIC_ENDPOAPI_BASE ?? "";
const NEWS_API_URL = process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ?? "";
const NEWS_TOKEN = process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ?? "";
const API_URL = `${ENDPOAPI_BASE}/api/live-quotes`;
const REFRESH_INTERVAL_MS = 300_000;

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value);

const formatPercent = (value: number) => {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
};

const parseFallbackTick = (tick: string, index: number): LiveTick => {
  const match = tick.match(/([+-]?\d+(?:\.\d+)?)%/);
  const percentText = match ? `${match[1]}%` : undefined;
  const tone = percentText
    ? percentText.startsWith("-")
      ? "down"
      : percentText.startsWith("+")
        ? "up"
        : "flat"
    : "flat";
  const cleaned = percentText ? tick.replace(percentText, "").trim() : tick;
  const [symbol, ...rest] = cleaned.split(" ");
  return {
    key: `fallback-${index}`,
    symbol,
    priceText: rest.join(" ").trim(),
    percentText,
    tone,
  };
};

export function TickerBar({
  ticks = [],
  topNews = "Trending",
}: TickerBarProps) {
  const { start, stop } = useLoading();
  const { locale } = useParams<{ locale?: string }>();
  const [liveTicks, setLiveTicks] = useState<LiveTick[]>(() =>
    ticks.map(parseFallbackTick),
  );
  const [newsTicks, setNewsTicks] = useState<LiveTick[]>([]);
  const initialLoad = useRef(true);

  useEffect(() => {
    let isActive = true;

    const toTick = (item: LiveQuote): LiveTick => {
      const tone =
        item.percentChange > 0
          ? "up"
          : item.percentChange < 0
            ? "down"
            : "flat";
      const priceText = formatNumber(item.price);
      const percentText = formatPercent(item.percentChange);
      return {
        key: `${item.symbol}-${item.serverTime ?? "now"}`,
        symbol: item.symbol,
        priceText,
        percentText,
        tone,
      };
    };

    const toNewsTick = (item: NewsItem): LiveTick => {
      const categorySlug = item.kategori?.slug?.trim();
      const articleSlug = item.slug?.trim();
      const href =
        categorySlug && articleSlug
          ? `/${locale ?? "id"}/news/${categorySlug}/${articleSlug}`
          : undefined;
      return {
        key: `news-${item.id}`,
        symbol: item.kategori?.name?.toUpperCase() || "NEWS",
        priceText: item.title?.trim() || "Latest update",
        tone: "flat",
        href,
      };
    };

    const loadLive = async () => {
      try {
        const response = await fetch(API_URL, { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (!isActive || payload?.status !== "success") return;
        const nextTicks = Array.isArray(payload.data)
          ? payload.data.map(toTick)
          : [];
        if (nextTicks.length) {
          setLiveTicks(nextTicks);
        }
      } catch {
        // keep fallback ticks
      }
    };

    const loadNews = async () => {
      try {
        const response = await fetch(NEWS_API_URL, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${NEWS_TOKEN}`,
          },
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (!isActive || payload?.status !== "success") return;
        const items = Array.isArray(payload.data) ? payload.data : [];
        const nextNews = items.slice(0, 8).map(toNewsTick);
        if (nextNews.length) {
          setNewsTicks(nextNews);
        }
      } catch {
        // keep previous news ticks
      }
    };

    const loadAll = async () => {
      const token = initialLoad.current ? start("ticker-bar") : null;
      try {
        await Promise.all([loadLive(), loadNews()]);
      } finally {
        if (token) stop(token);
        initialLoad.current = false;
      }
    };

    loadAll();
    const interval = window.setInterval(() => {
      loadLive();
      loadNews();
    }, REFRESH_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(interval);
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
    const percentClass =
      item.tone === "up"
        ? isPrimary
          ? "text-emerald-300"
          : "text-emerald-200"
        : item.tone === "down"
          ? "text-rose-300"
          : "text-white/60";
    const wrapperClass =
      "inline-flex items-center gap-2 transition-colors hover:text-white";
    const content = (
      <>
        <span className={symbolClass}>{item.symbol}</span>
        <span className="text-white/80">{item.priceText}</span>
        {item.percentText ? (
          <span className={percentClass}>{item.percentText}</span>
        ) : null}
      </>
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
    <div className="flex justify-center bg-blue-950">
      <div className="ticker-wrapper py-1 flex w-full max-w-7xl items-center gap-4 overflow-hidden text-[11px] font-medium text-white shadow-lg sm:text-xs">
        {/* Top News / Label */}
        <div className="bg-linear-to-r from-blue-950 z-10">
          <div className="flex shrink-0 items-center ml-2 sm:ml-0 gap-2 rounded-l-full bg-linear-to-r from-white via-white/80 to-white/0 p-0.5 pr-16">
            <p className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
              <i className="fa-solid fa-bolt text-[10px]" aria-hidden="true" />
            </p>

            <p className="text-[10px] text-nowrap font-bold uppercase tracking-[0.2em] text-red-800 sm:text-[11px]">
              Trending
            </p>
          </div>
        </div>

        {/* Running Text / Ticker */}
        <div className="flex-1">
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
