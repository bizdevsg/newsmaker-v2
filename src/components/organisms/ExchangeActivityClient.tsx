"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../atoms/Card";
import { StatTile } from "../molecules/StatTile";
import type { Messages } from "@/locales";
import { useLoading } from "../providers/LoadingProvider";
import type {
  FxResponse,
  IhsgResponse,
  LiveQuoteItem,
  LiveQuoteResponse,
} from "@/types/indonesiaMarket";

type ExchangeActivityClientProps = {
  messages: Messages;
  liveQuotes?: LiveQuoteResponse | null;
  fxResponse?: FxResponse | null;
  ihsgResponse?: IhsgResponse | null;
};

type StatItem = {
  key: string;
  label: string;
  value: string;
  delta: string;
  tone: "up" | "down" | "flat";
};

type InvestingQuote = {
  symbol: string;
  last: number;
  change: number;
  change_percent: number;
  currency?: string;
};

const LIVE_QUOTES_URL =
  "https://endpoapi-production-3202.up.railway.app/api/live-quotes";
const INVESTING_URL = "/api/investing";

const formatNumber = (value: number | undefined, digits = 0) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

const formatPercent = (value: number | undefined) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export function ExchangeActivityClient({
  messages,
  liveQuotes,
  fxResponse,
  ihsgResponse,
}: ExchangeActivityClientProps) {
  const loading = useLoading();
  const tabs = messages.exchangeActivity.tabs;
  const initialKey =
    tabs.find((tab) => tab.key === messages.exchangeActivity.activeTabKey)
      ?.key ?? tabs[0]?.key ?? "markets";
  const [activeKey, setActiveKey] = useState(initialKey);
  const [liveStats, setLiveStats] = useState<Record<string, StatItem[]>>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(
    liveQuotes?.updatedAt ?? liveQuotes?.serverTime ?? null,
  );
  const initialLoad = useRef(true);

  const toStat = (item: LiveQuoteItem): StatItem => {
    const percent = item.percentChange ?? 0;
    const tone = percent > 0 ? "up" : percent < 0 ? "down" : "flat";
    const value =
      typeof item.price === "number"
        ? formatNumber(item.price, 2)
        : typeof item.last === "number"
          ? formatNumber(item.last, 2)
          : undefined;
    return {
      key: item.symbol,
      label: item.symbol,
      value: value ?? "-",
      delta: formatPercent(percent) ?? "-",
      tone,
    };
  };

  const toStatInvesting = (item: InvestingQuote): StatItem => {
    const percent = item.change_percent ?? 0;
    const tone = percent > 0 ? "up" : percent < 0 ? "down" : "flat";
    const value = formatNumber(item.last, 2);
    return {
      key: item.symbol,
      label: item.symbol,
      value: value ?? "-",
      delta: formatPercent(percent) ?? "-",
      tone,
    };
  };

  const categoryForSymbol = (symbol?: string) => {
    if (!symbol) return "markets";
    const upper = symbol.toUpperCase();
    if (upper.endsWith("F_BBJ")) return "rates";
    if (upper.includes("BCO")) return "derivatives";
    if (upper.includes("K50") || upper.startsWith("XU")) return "markets";
    return "flows";
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const token = initialLoad.current
        ? loading.start("exchange-activity")
        : null;
      try {
        const [liveRes, investingRes] = await Promise.all([
          fetch(LIVE_QUOTES_URL, { cache: "no-store" }),
          fetch(INVESTING_URL, { cache: "no-store" }),
        ]);

        const nextStats: Record<string, StatItem[]> = {};
        let nextUpdatedAt: string | null = null;

        if (liveRes.ok) {
          const payload = await liveRes.json();
          if (isActive && payload?.status === "success") {
            const data: LiveQuoteItem[] = Array.isArray(payload.data)
              ? payload.data
              : [];
            data.forEach((item) => {
              const key = categoryForSymbol(item.symbol);
              if (!nextStats[key]) nextStats[key] = [];
              nextStats[key].push(toStat(item));
            });
            nextUpdatedAt = payload.updatedAt ?? payload.serverTime ?? null;
          }
        }

        if (investingRes.ok) {
          const payload = await investingRes.json();
          if (isActive && payload?.status === "success") {
            const data: InvestingQuote[] = Array.isArray(payload.data)
              ? payload.data
              : [];
            data.forEach((item) => {
              const key = categoryForSymbol(item.symbol) ?? "markets";
              if (!nextStats[key]) nextStats[key] = [];
              nextStats[key].push(toStatInvesting(item));
            });
            if (!nextUpdatedAt) nextUpdatedAt = payload.fetched_at ?? null;
          }
        }

        if (Object.keys(nextStats).length) {
          setLiveStats(nextStats);
        }
        if (nextUpdatedAt) setUpdatedAt(nextUpdatedAt);
      } catch {
        // keep previous stats
      } finally {
        if (token) loading.stop(token);
        initialLoad.current = false;
      }
    };

    load();
    const interval = window.setInterval(load, 30000);
    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, []);

  const fallbackStatsByTab = useMemo<Record<string, StatItem[]>>(() => {
    const quotes = Array.isArray(liveQuotes?.data) ? liveQuotes?.data : [];
    const baseStats = messages.exchangeActivity.stats.map((stat) => ({
      key: stat.key,
      label: stat.label,
      value: stat.value,
      delta: stat.delta,
      tone:
        stat.tone === "up" || stat.tone === "down" || stat.tone === "flat"
          ? stat.tone
          : "flat",
    }));

    const liveByTab: Record<string, StatItem[]> = {};
    quotes.forEach((quote) => {
      const tabKey = categoryForSymbol(quote.symbol);
      if (!liveByTab[tabKey]) liveByTab[tabKey] = [];
      liveByTab[tabKey].push(toStat(quote));
    });

    // Enrich base stats with fx/ihsg for the markets tab when available
    const usdRow = fxResponse?.data?.find((row) => row.currency === "USD");
    const usdValue = typeof usdRow?.sell === "number" ? formatNumber(usdRow.sell) : undefined;

    const ihsgData = ihsgResponse?.indices?.composite;
    const ihsgValue =
      typeof ihsgData?.last === "number" ? ihsgData.last : undefined;
    const ihsgChange =
      typeof ihsgData?.change === "number" ? ihsgData.change : undefined;
    const ihsgDelta =
      typeof ihsgData?.change_percent === "number"
        ? ihsgData.change_percent
        : ihsgValue && ihsgChange
          ? (ihsgChange / ihsgValue) * 100
          : undefined;
    const ihsgTone =
      ihsgData?.direction === "down"
        ? "down"
        : ihsgData?.direction === "up"
          ? "up"
          : ihsgDelta !== undefined
            ? ihsgDelta < 0
              ? "down"
              : "up"
            : undefined;

    const enrichedBaseStats = baseStats.map((stat) => {
      if (stat.key === "ihsg") {
        return {
          ...stat,
          value: ihsgValue ? (formatNumber(ihsgValue) ?? stat.value) : stat.value,
          delta: ihsgDelta ? (formatPercent(ihsgDelta) ?? stat.delta) : stat.delta,
          tone: (ihsgTone ?? stat.tone) as "up" | "down" | "flat",
        };
      }
      if (stat.key === "idr-usd") {
        return {
          ...stat,
          value: usdValue ?? stat.value,
        };
      }
      return stat;
    });

    const result: Record<string, StatItem[]> = {};
    tabs.forEach((tab) => {
      const items = liveByTab[tab.key];
      result[tab.key] =
        items && items.length
          ? items
          : tab.key === "markets"
            ? enrichedBaseStats
            : baseStats;
    });
    return result;
  }, [fxResponse, ihsgResponse, liveQuotes, messages, tabs]);

  const activeStats = liveStats[activeKey]?.length
    ? liveStats[activeKey]
    : (fallbackStatsByTab[activeKey] ?? []);

  return (
    <Card as="section">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {messages.exchangeActivity.title}
        </h3>
      </div>
      <div className="px-6 pb-6 pt-4">
        <div className="inline-flex items-center overflow-hidden rounded-md border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveKey(tab.key)}
              className={`cursor-pointer border-r border-slate-200 px-4 py-1.5 transition-colors last:border-r-0 ${
                tab.key === activeKey
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-800 hover:bg-white hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {activeStats.map((stat) => (
            <StatTile
              key={stat.key}
              label={stat.label}
              value={stat.value}
              delta={stat.delta}
              tone={stat.tone}
            />
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-100 p-4 text-xs text-slate-500">
          {updatedAt
            ? `Updated ${updatedAt}`
            : messages.exchangeActivity.heatmapNote}
        </div>
      </div>
    </Card>
  );
}
