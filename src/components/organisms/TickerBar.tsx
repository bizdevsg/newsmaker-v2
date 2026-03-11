"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
const API_URL = `${ENDPOAPI_BASE}/api/live-quotes`;
const NEWS_API_URL = process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ?? "";
const NEWS_TOKEN = process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ?? "";

export function TickerBar({ ticks = [], topNews = "Top News" }: TickerBarProps) {
  const { start, stop } = useLoading();
  const { locale } = useParams<{ locale?: string }>();
  const [liveTicks, setLiveTicks] = useState<LiveTick[]>(
    ticks.map((tick, index) => {
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
    }),
  );
  const [newsTicks, setNewsTicks] = useState<LiveTick[]>([]);
  const initialLoad = useRef(true);

  useEffect(() => {
    let isActive = true;

    const formatNumber = (value: number) =>
      new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(
        value,
      );

    const formatPercent = (value: number) => {
      const sign = value > 0 ? "+" : value < 0 ? "-" : "";
      return `${sign}${Math.abs(value).toFixed(2)}%`;
    };

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
    }, 300000);

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
    const symbolClass = isPrimary ? "text-blue-700" : "text-blue-900";
    const percentClass =
      item.tone === "up"
        ? isPrimary
          ? "text-emerald-700"
          : "text-emerald-600"
        : item.tone === "down"
          ? "text-rose-600"
          : "text-slate-500";
    const wrapperClass =
      "inline-flex items-center gap-2 transition-colors hover:text-slate-900";
    const content = (
      <>
        <span className={symbolClass}>
          {isPrimary ? `(${item.symbol})` : item.symbol}
        </span>
        <span className="text-slate-700">{item.priceText}</span>
        {item.percentText ? (
          <span className={percentClass}>
            {isPrimary ? `(${item.percentText})` : item.percentText}
          </span>
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
    <div className="ticker-wrapper overflow-hidden rounded-md bg-blue-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900 shadow-lg sm:px-6 sm:py-3 sm:text-xs sm:tracking-[0.2em]">
      <div className="relative pr-16 sm:pr-28">
        <div className="ticker-track">
          <div className="ticker-row">
            {tickStream.map((entry, index) => {
              const next = tickStream[index + 1];
              if (entry.type === "pipe") {
                return (
                  <span
                    key={`${entry.key}-${index}`}
                    className="ticker-sep"
                    aria-hidden="true"
                  >
                    |
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
                    className="ticker-sep"
                    aria-hidden="true"
                  >
                    |
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
        <div className="pointer-events-none absolute -left-2 top-1/2 -translate-y-1/2 rounded bg-red-600 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-sm sm:-left-4 sm:px-3 sm:text-[10px]">
          {topNews}
        </div>
      </div>
    </div>
  );
}
