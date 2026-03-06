"use client";

import React, { useEffect, useRef, useState } from "react";
import TradingViewWidget from "./TradingViewWidget";
import { SectionHeader } from "../molecules/SectionHeader";

type LiveChartItem = {
  symbol: string;
  price: number;
  percentChange: number;
};

type LiveChartSectionProps = {
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

const defaultIcon =
  "/assets/189984778_403d4105-1b62-4ce1-b050-d4de12876a2b.svg";

const symbolMeta: Record<
  string,
  { name: string; iconSrc?: string; iconAlt: string }
> = {
  XUL10: { name: "Gold", iconAlt: "Icon Gold" },
  BCO10_BBJ: { name: "Oil", iconAlt: "Icon Oil" },
  HKK50_BBJ: { name: "Hang Seng", iconAlt: "Icon HKK50" },
  JPK50_BBJ: { name: "Nikkei", iconAlt: "Icon JPK50" },
  AU10F_BBJ: { name: "AUD/USD", iconAlt: "Icon AU10F" },
  EU10F_BBJ: { name: "EUR/USD", iconAlt: "Icon EU10F" },
  GU10F_BBJ: { name: "GBP/USD", iconAlt: "Icon GU10F" },
  UC10F_BBJ: { name: "USD/CHF", iconAlt: "Icon UC10F" },
  UJ10F_BBJ: { name: "USD/JPY", iconAlt: "Icon UJ10F" },
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

export function LiveChartSection({
  initialItems = [],
  initialUpdatedAt,
  initialServerTime,
  refreshMs = 15000,
}: LiveChartSectionProps) {
  const [items, setItems] = useState<LiveChartItem[]>(initialItems);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(
    initialUpdatedAt,
  );
  const [serverTime, setServerTime] = useState<string | undefined>(
    initialServerTime,
  );
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const apiUrl =
    "https://endpoapi-production-3202.up.railway.app/api/live-quotes";

  useEffect(() => {
    let isMounted = true;

    const fetchQuotes = async () => {
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
  const loopDuration = Math.max(12, items.length * 2.5);

  const subtitle =
    serverTime && updatedAt
      ? `Updated ${serverTime} (${updatedAt.slice(0, 10)})`
      : "Updated just now";

  return (
    <section className="rounded-lg bg-white shadow overflow-hidden h-full">
      <SectionHeader title="Live Market Quotes" optional={subtitle} />

      <div ref={scrollerRef} className="overflow-hidden px-4 py-4">
        {items.length === 0 ? (
          <div className="text-xs text-slate-500">Data belum tersedia.</div>
        ) : (
          <div
            className="live-quote-track flex w-max gap-3"
            style={{ ["--duration" as never]: `${loopDuration}s` }}
          >
            {loopItems.map((item, index) => {
              const meta = symbolMeta[item.symbol];
              const name = meta?.name ?? item.symbol;
              const iconSrc = meta?.iconSrc ?? defaultIcon;
              const iconAlt = meta?.iconAlt ?? `Icon ${item.symbol}`;
              const change = formatPercent(item.percentChange);

              return (
                <div
                  key={`${item.symbol}-${index}`}
                  className="min-w-[220px] rounded-lg border border-slate-200 bg-slate-50/70 p-3 transition hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-200/80">
                      <img src={iconSrc} alt={iconAlt} className="h-5" />
                    </div>
                    <div className="w-full">
                      <h4 className="text-base font-semibold text-slate-900">
                        {name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center justify-between gap-2 w-full">
                        <p className="text-xs font-semibold text-blue-700">
                          {item.symbol}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            change.startsWith("-")
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {change}
                        </p>
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
        .live-quote-track {
          animation: live-quote-scroll var(--duration, 16s) linear infinite;
        }

        @keyframes live-quote-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div className="border-t border-slate-100 bg-slate-950">
        <div className="h-[420px] w-full">
          <TradingViewWidget />
        </div>
      </div>
    </section>
  );
}
