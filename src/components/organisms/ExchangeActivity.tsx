 "use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../atoms/Card";
import { StatTile } from "../molecules/StatTile";
import type { Messages } from "@/locales";
import { useLoading } from "../providers/LoadingProvider";

type ExchangeActivityProps = {
  messages: Messages;
};

type InvestingQuote = {
  symbol: string;
  last: number;
  change: number;
  change_percent: number;
  currency?: string;
};

type StatItem = {
  key: string;
  label: string;
  value: string;
  delta: string;
  tone: "up" | "down" | "flat";
};

const API_URL = "/api/investing";

export function ExchangeActivity({ messages }: ExchangeActivityProps) {
  const loading = useLoading();
  const tabs = messages.exchangeActivity.tabs;
  const initialKey =
    tabs.find((tab) => tab.key === messages.exchangeActivity.activeTabKey)
      ?.key ?? tabs[0]?.key ?? "markets";
  const [activeKey, setActiveKey] = useState(initialKey);
  const [liveStats, setLiveStats] = useState<Record<string, StatItem[]>>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const initialLoad = useRef(true);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value);

  const formatPercent = (value: number) => {
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
    return `${sign}${Math.abs(value).toFixed(2)}%`;
  };

  const toStat = (item: InvestingQuote): StatItem => {
    const tone =
      item.change_percent > 0
        ? "up"
        : item.change_percent < 0
          ? "down"
          : "flat";
    return {
      key: item.symbol,
      label: item.symbol,
      value: formatNumber(item.last),
      delta: formatPercent(item.change_percent),
      tone,
    };
  };

  const categoryForSymbol = () => "markets";

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const token = initialLoad.current
        ? loading.start("exchange-activity")
        : null;
      try {
        const response = await fetch(API_URL, { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (!isActive || payload?.status !== "success") return;
        const data: InvestingQuote[] = Array.isArray(payload.data)
          ? payload.data
          : [];

        const nextStats: Record<string, StatItem[]> = {};
        data.forEach((item) => {
          const key = categoryForSymbol(item.symbol);
          if (!nextStats[key]) nextStats[key] = [];
          nextStats[key].push(toStat(item));
        });

        setLiveStats(nextStats);
        setUpdatedAt(payload.fetched_at ?? null);
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

  const fallbackStats = useMemo<StatItem[]>(
    () =>
      messages.exchangeActivity.stats.map((stat) => ({
        key: stat.key,
        label: stat.label,
        value: stat.value,
        delta: stat.delta,
        tone:
          stat.tone === "up" || stat.tone === "down" || stat.tone === "flat"
            ? stat.tone
            : "flat",
      })),
    [messages],
  );

  const activeStats = liveStats[activeKey]?.length
    ? liveStats[activeKey]
    : fallbackStats;

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
