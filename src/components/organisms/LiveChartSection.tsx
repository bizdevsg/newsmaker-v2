"use client";

import React, { useEffect, useRef, useState } from "react";
import TradingViewWidget from "./TradingViewWidget";
import { SectionHeader } from "../molecules/SectionHeader";
import { useLoading } from "../providers/LoadingProvider";
import { useParams } from "next/navigation";

import type { Messages } from "@/locales";

type LiveChartItem = {
  symbol: string;
  price: number;
  percentChange: number;
};

type LiveChartSectionProps = {
  locale?: string;
  messages?: Messages;
  initialItems?: LiveChartItem[];
  initialUpdatedAt?: string;
  initialServerTime?: string;
  refreshMs?: number;
};

type LiveQuotesResponse = {
  updatedAt?: string;
  serverTime?: string;
  data?: LiveChartItem[];
};

const symbolMeta: Record<
  string,
  {
    title: string;
    subtitle: string;
    icon: string;
    iconColor: string;
    tvSymbol: string;
  }
> = {
  XUL10: {
    title: "Gold Spot",
    subtitle: "XAU/USD",
    icon: "fa-brands fa-bitcoin",
    iconColor: "text-yellow-500",
    tvSymbol: "OANDA:XAUUSD",
  },
  BCO10_BBJ: {
    title: "Brent Crude Oil",
    subtitle: "BCO/USD",
    icon: "fa-solid fa-droplet",
    iconColor: "text-slate-800",
    tvSymbol: "TVC:UKOIL",
  },
  HKK50_BBJ: {
    title: "Hang Seng",
    subtitle: "HKK50",
    icon: "fa-solid fa-chart-pie",
    iconColor: "text-red-500",
    tvSymbol: "HSI:HSI",
  },
  JPK50_BBJ: {
    title: "Nikkei",
    subtitle: "JPK50",
    icon: "fa-solid fa-chart-pie",
    iconColor: "text-red-500",
    tvSymbol: "TVC:NI225",
  },
  AU10F_BBJ: {
    title: "AUD/USD",
    subtitle: "Forex",
    icon: "fa-solid fa-coins",
    iconColor: "text-blue-500",
    tvSymbol: "FX:AUDUSD",
  },
  EU10F_BBJ: {
    title: "EUR/USD",
    subtitle: "Forex",
    icon: "fa-solid fa-coins",
    iconColor: "text-blue-500",
    tvSymbol: "FX:EURUSD",
  },
  GU10F_BBJ: {
    title: "GBP/USD",
    subtitle: "Forex",
    icon: "fa-solid fa-coins",
    iconColor: "text-blue-500",
    tvSymbol: "FX:GBPUSD",
  },
  UC10F_BBJ: {
    title: "USD/CHF",
    subtitle: "Forex",
    icon: "fa-solid fa-coins",
    iconColor: "text-blue-500",
    tvSymbol: "FX:USDCHF",
  },
  UJ10F_BBJ: {
    title: "USD/JPY",
    subtitle: "Forex",
    icon: "fa-solid fa-coins",
    iconColor: "text-blue-500",
    tvSymbol: "FX:USDJPY",
  },
};

const formatPercent = (value: number) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

const formatPrice = (value: number) => {
  const digits = Math.abs(value) >= 1 ? 2 : 4;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

const ENDPOAPI_BASE = process.env.NEXT_PUBLIC_ENDPOAPI_BASE ?? "";

export function LiveChartSection({
  locale: propLocale,
  messages,
  initialItems = [],
  initialUpdatedAt,
  initialServerTime,
  refreshMs = 15000,
}: LiveChartSectionProps) {
  const loading = useLoading();
  const [items, setItems] = useState<LiveChartItem[]>(initialItems);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(
    initialUpdatedAt,
  );
  const [serverTime, setServerTime] = useState<string | undefined>(
    initialServerTime,
  );
  const [chartSymbol, setChartSymbol] = useState("OANDA:XAUUSD");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { locale: routeLocale } = useParams<{ locale?: string }>();
  const locale = propLocale || routeLocale;
  const initialLoad = useRef(true);
  const apiUrl = `${ENDPOAPI_BASE}/api/live-quotes`;

  useEffect(() => {
    let isMounted = true;

    const fetchQuotes = async () => {
      const token = initialLoad.current ? loading.start("live-chart") : null;
      try {
        const response = await fetch(apiUrl, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as LiveQuotesResponse;
        if (!isMounted) return;
        setItems(data.data ?? []);
        setUpdatedAt(data.updatedAt);
        setServerTime(data.serverTime);
      } catch {
        // ignore transient errors; keep last good data
      } finally {
        if (token) loading.stop(token);
        initialLoad.current = false;
      }
    };

    fetchQuotes();
    const id = window.setInterval(fetchQuotes, refreshMs);
    return () => {
      isMounted = false;
      window.clearInterval(id);
    };
  }, [apiUrl, refreshMs]);

  const loopItems =
    items.length > 0 ? [...items, ...items] : ([] as LiveChartItem[]);
  const loopDuration = Math.max(20, items.length * 4.5);

  const subtitle =
    serverTime && updatedAt
      ? `Updated ${serverTime} (${updatedAt.slice(0, 10)})`
      : "Updated just now";

  return (
    <section className="min-w-0 rounded-lg bg-white shadow overflow-hidden h-fit">
      <SectionHeader
        title={
          locale === "id" ? "Kutipan Pasar Langsung" : "Live Market Quotes"
        }
        optional={subtitle}
      />

      <div ref={scrollerRef} className="overflow-hidden px-4 py-4">
        {items.length === 0 ? (
          <div className="text-xs text-slate-500">
            {messages?.widgets?.calendarEkonomi?.noData ||
              (locale === "id"
                ? "Data belum tersedia."
                : "Data not available.")}
          </div>
        ) : (
          <div
            className="live-quote-track-policy flex w-max gap-4"
            style={{ ["--duration" as never]: `${loopDuration}s` }}
          >
            {loopItems.map((item, index) => {
              const meta = symbolMeta[item.symbol];
              const title = meta?.title ?? item.symbol;
              const subtitle = meta?.subtitle ?? item.symbol;
              const icon = meta?.icon ?? "fa-solid fa-chart-line";
              const iconColor = meta?.iconColor ?? "text-blue-600";
              const tvSymbol = meta?.tvSymbol ?? "IDX:COMPOSITE";
              const change = formatPercent(item.percentChange);
              const isUp = item.percentChange >= 0;

              return (
                <div
                  key={`${item.symbol}-${index}`}
                  onClick={() => setChartSymbol(tvSymbol)}
                  className={`flex-none w-[260px] p-4 flex flex-col justify-center rounded-md border transition shadow-sm hover:shadow-md cursor-pointer ${
                    chartSymbol === tvSymbol
                      ? "bg-blue-50 border-blue-300 ring-1 ring-blue-100"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 ${iconColor}`}
                      >
                        <i className={`${icon} text-lg`}></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                          {title}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold tracking-wide uppercase">
                          {subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div
                        className={`flex items-center gap-1 font-bold text-sm ${
                          isUp ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {formatPrice(item.price)}
                      </div>
                      <div
                        className={`text-xs font-bold mt-1 ${
                          change.startsWith("-")
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        <i
                          className={`fa-solid ${
                            isUp ? "fa-caret-up" : "fa-caret-down"
                          } mr-1`}
                        ></i>
                        {change}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .live-quote-track-policy {
          animation: live-quote-scroll-policy var(--duration, 16s) linear
            infinite;
        }

        .live-quote-track-policy:hover {
          animation-play-state: paused;
        }

        @keyframes live-quote-scroll-policy {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div className="border-t border-slate-100 bg-slate-950">
        <div className="h-[420px] w-full min-w-0 overflow-hidden">
          <TradingViewWidget symbol={chartSymbol} />
        </div>
      </div>
    </section>
  );
}
