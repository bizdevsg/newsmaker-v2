"use client";

import React, { useEffect, useMemo, useState } from "react";

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

const API_URL =
  "https://endpoapi-production-3202.up.railway.app/api/live-quotes";

export function TickerBar({ ticks = [] }: TickerBarProps) {
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

    const load = async () => {
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

    load();
    const interval = window.setInterval(load, 300000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, []);

  const tickStream = useMemo(
    () => [...liveTicks, ...liveTicks, ...liveTicks],
    [liveTicks],
  );

  return (
    <div className="overflow-hidden rounded-md bg-blue-200 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-lg">
      <div className="ticker-track">
        <div className="ticker-row">
          {tickStream.map((tick, index) => (
            <span
              key={`${tick.key}-${index}`}
              className="inline-flex items-center gap-2 border-r border-slate-300/60 pr-4 last:border-r-0 last:pr-0"
            >
              <span className="text-blue-900">{tick.symbol}</span>
              <span className="text-slate-700">{tick.priceText}</span>
              {tick.percentText ? (
                <span
                  className={
                    tick.tone === "up"
                      ? "text-emerald-600"
                      : tick.tone === "down"
                        ? "text-rose-600"
                        : "text-slate-500"
                  }
                >
                  ({tick.percentText})
                </span>
              ) : null}
            </span>
          ))}
        </div>
        <div className="ticker-row" aria-hidden="true">
          {tickStream.map((tick, index) => (
            <span
              key={`${tick.key}-dup-${index}`}
              className="inline-flex items-center gap-2 border-r border-slate-300/60 pr-4 last:border-r-0 last:pr-0"
            >
              <span className="text-blue-900">{tick.symbol}</span>
              <span className="text-slate-700">{tick.priceText}</span>
              {tick.percentText ? (
                <span
                  className={
                    tick.tone === "up"
                      ? "text-emerald-600"
                      : tick.tone === "down"
                        ? "text-rose-600"
                        : "text-slate-500"
                  }
                >
                  {tick.percentText}
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
