"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLoading } from "../providers/LoadingProvider";

type TickerBarProps = {
  ticks?: string[];
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
};

type NewsItem = {
  id: number;
  title?: string;
  created_at?: string;
  kategori?: {
    name?: string;
  };
};

const ENDPOAPI_BASE = process.env.NEXT_PUBLIC_ENDPOAPI_BASE ?? "";
const API_URL = `${ENDPOAPI_BASE}/api/live-quotes`;
const NEWS_API_URL = process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ?? "";
const NEWS_TOKEN = process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ?? "";

export function TickerBar({ ticks = [] }: TickerBarProps) {
  const loading = useLoading();
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

    const toNewsTick = (item: NewsItem): LiveTick => ({
      key: `news-${item.id}`,
      symbol: item.kategori?.name?.toUpperCase() || "NEWS",
      priceText: item.title?.trim() || "Latest update",
      tone: "flat",
    });

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
      const token = initialLoad.current ? loading.start("ticker-bar") : null;
      try {
        await Promise.all([loadLive(), loadNews()]);
      } finally {
        if (token) loading.stop(token);
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
  }, []);

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

  return (
    <div className="ticker-wrapper overflow-hidden rounded-md bg-blue-200 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-lg">
      <div className="relative pr-28">
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

              return (
                <span
                  key={`${entry.item.key}-${index}`}
                  className="inline-flex items-center gap-2"
                >
                  <span className="text-blue-700">({entry.item.symbol})</span>
                  <span className="text-slate-700">{entry.item.priceText}</span>
                  {entry.item.percentText ? (
                    <span
                      className={
                        entry.item.tone === "up"
                          ? "text-emerald-700"
                          : entry.item.tone === "down"
                            ? "text-rose-600"
                            : "text-slate-500"
                      }
                    >
                      ({entry.item.percentText})
                    </span>
                  ) : null}
                  {next?.type === "tick" ? (
                    <span className="ticker-dot" aria-hidden="true">
                      •
                    </span>
                  ) : null}
                </span>
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

              return (
                <span
                  key={`${entry.item.key}-dup-${index}`}
                  className="inline-flex items-center gap-2"
                >
                  <span className="text-blue-900">{entry.item.symbol}</span>
                  <span className="text-slate-700">{entry.item.priceText}</span>
                  {entry.item.percentText ? (
                    <span
                      className={
                        entry.item.tone === "up"
                          ? "text-emerald-600"
                          : entry.item.tone === "down"
                            ? "text-rose-600"
                            : "text-slate-500"
                      }
                    >
                      {entry.item.percentText}
                    </span>
                  ) : null}
                  {next?.type === "tick" ? (
                    <span className="ticker-dot" aria-hidden="true">
                      •
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        </div>
        <div className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 rounded bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm">
          Top News
        </div>
      </div>
    </div>
  );
}
