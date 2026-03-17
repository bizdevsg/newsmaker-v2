"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Messages } from "@/locales";
import { PivotFibonacci } from "./PivotFibonacci";
import { PolicyHistoricData } from "./PolicyHistoricData";
import { useLoading } from "../providers/LoadingProvider";
import { PolicyQuickDataTabs } from "./PolicyQuickDataTabs";
import { PolicyQuickDataCalendar } from "./PolicyQuickDataCalendar";
import { PolicyQuickDataLiveChart } from "./PolicyQuickDataLiveChart";

type PolicyQuickDataProps = {
  messages: Messages;
  locale?: string;
};

const ENDPOAPI_BASE = process.env.NEXT_PUBLIC_ENDPOAPI_BASE ?? "";

export function PolicyQuickData({ messages, locale = "id" }: PolicyQuickDataProps) {
  const loading = useLoading();
  const { quickData } = messages.policy;
  const [activeTab, setActiveTab] = useState(quickData.tabs[0].key);
  const initialCalendarLoad = useRef(true);
  const initialLiveLoad = useRef(true);

  // Calendar State
  const [calendarTimeFrame, setCalendarTimeFrame] = useState<
    "today" | "this-week" | "previous-week" | "next-week"
  >("today");
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [calendarPage, setCalendarPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Reset pagination and expanded row when timeframe changes
  useEffect(() => {
    setCalendarPage(1);
    setExpandedRow(null);
  }, [calendarTimeFrame]);

  // Live Chart State
  const [liveStats, setLiveStats] = useState<any[]>([]);
  const [chartSymbol, setChartSymbol] = useState("OANDA:XAUUSD");
  useEffect(() => {
    if (activeTab === "calendar") {
      const fetchCalendar = async () => {
        const token = initialCalendarLoad.current
          ? loading.start("policy-calendar")
          : null;
        try {
          const res = await fetch(
            `${ENDPOAPI_BASE}/api/calendar/${calendarTimeFrame}`,
          );
          const json = await res.json();
          if (json && json.data) {
            setCalendarData(json.data);
          }
        } catch (error) {
          console.error("Failed to fetch calendar", error);
        } finally {
          if (token) loading.stop(token);
          initialCalendarLoad.current = false;
        }
      };
      fetchCalendar();
    }
  }, [activeTab, calendarTimeFrame]);

  // Fetch Live Quotes
  useEffect(() => {
    if (activeTab === "liveChart") {
      const fetchQuotes = async () => {
        const token = initialLiveLoad.current
          ? loading.start("policy-live-quotes")
          : null;
        try {
          const res = await fetch(`/api/live-quotes`);
          const json = await res.json();
          if (json && json.data) {
            const mappedStats = json.data.map((item: any) => {
              let title = item.symbol;
              let subtitle = item.symbol;
              let icon = "fa-brands fa-bitcoin";
              let iconColor = "text-yellow-500";
              let tvSymbol = "IDX:COMPOSITE";

              if (item.symbol === "XUL10") {
                title = "Gold Spot";
                subtitle = "XAU/USD";
                tvSymbol = "OANDA:XAUUSD";
              } else if (item.symbol === "BCO10_BBJ") {
                title = "Brent Crude Oil";
                subtitle = "BCO/USD";
                iconColor = "text-slate-800";
                icon = "fa-solid fa-droplet";
                tvSymbol = "TVC:UKOIL";
              } else if (item.symbol === "HKK50_BBJ") {
                title = "Hang Seng";
                subtitle = "HKK50";
                iconColor = "text-red-500";
                icon = "fa-solid fa-chart-pie";
                tvSymbol = "HSI:HSI";
              } else if (item.symbol === "JPK50_BBJ") {
                title = "Nikkei";
                subtitle = "JPK50";
                iconColor = "text-red-500";
                icon = "fa-solid fa-chart-pie";
                tvSymbol = "TVC:NI225";
              } else if (item.symbol === "AU10F_BBJ") {
                title = "AUD/USD";
                subtitle = "Forex";
                iconColor = "text-blue-500";
                icon = "fa-solid fa-coins";
                tvSymbol = "FX:AUDUSD";
              } else if (item.symbol === "EU10F_BBJ") {
                title = "EUR/USD";
                subtitle = "Forex";
                iconColor = "text-blue-500";
                icon = "fa-solid fa-coins";
                tvSymbol = "FX:EURUSD";
              } else if (item.symbol === "GU10F_BBJ") {
                title = "GBP/USD";
                subtitle = "Forex";
                iconColor = "text-blue-500";
                icon = "fa-solid fa-coins";
                tvSymbol = "FX:GBPUSD";
              } else if (item.symbol === "UC10F_BBJ") {
                title = "USD/CHF";
                subtitle = "Forex";
                iconColor = "text-blue-500";
                icon = "fa-solid fa-coins";
                tvSymbol = "FX:USDCHF";
              } else if (item.symbol === "UJ10F_BBJ") {
                title = "USD/JPY";
                subtitle = "Forex";
                iconColor = "text-blue-500";
                icon = "fa-solid fa-coins";
                tvSymbol = "FX:USDJPY";
              }

              return {
                title,
                subtitle,
                tvSymbol,
                value: item.price.toString(),
                change: `${item.percentChange > 0 ? "+" : ""}${item.percentChange.toFixed(2)}%`,
                isUp: item.percentChange >= 0,
                icon,
                iconColor,
              };
            });

            if (mappedStats.length > 0) {
              setLiveStats(mappedStats);
            }
          }
        } catch (err) {
          console.error("Failed to fetch live quotes", err);
        } finally {
          if (token) loading.stop(token);
          initialLiveLoad.current = false;
        }
      };
      fetchQuotes();
    }
  }, [activeTab]);

  const loopItems = liveStats.length > 0 ? [...liveStats, ...liveStats] : [];
  const loopDuration = Math.max(12, liveStats.length * 2.5);

  const calendarItemsPerPage = 10;
  const totalCalendarPages = Math.ceil(
    calendarData.length / calendarItemsPerPage,
  );
  const paginatedCalendarData = calendarData.slice(
    (calendarPage - 1) * calendarItemsPerPage,
    calendarPage * calendarItemsPerPage,
  );

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100 mb-8 mt-2 overflow-hidden min-w-0 w-full relative">
      <div className="mb-6 flex items-end justify-between border-b border-slate-200">
        <div className="border-b-2 border-blue-700 pb-3 mb-[-1px] px-1">
          <h2 className="text-xl font-bold text-blue-900 tracking-tight">
            {quickData.title}
          </h2>
        </div>
      </div>

      <PolicyQuickDataTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        quickData={quickData}
      />

      {activeTab === "calendar" && (
        <PolicyQuickDataCalendar
          calendarTimeFrame={calendarTimeFrame}
          onTimeFrameChange={setCalendarTimeFrame}
          paginatedCalendarData={paginatedCalendarData}
          calendarPage={calendarPage}
          totalCalendarPages={totalCalendarPages}
          onPageChange={setCalendarPage}
          expandedRow={expandedRow}
          onToggleRow={(row) => setExpandedRow(row === -1 ? null : row)}
          messages={messages}
          locale={locale}
        />
      )}

      {activeTab === "fibonacci" && <PivotFibonacci messages={messages} locale={locale} />}


      {activeTab === "liveChart" && (
        <PolicyQuickDataLiveChart
          loopItems={loopItems}
          loopDuration={loopDuration}
          chartSymbol={chartSymbol}
          onSelectSymbol={setChartSymbol}
        />
      )}

      {activeTab === "historic" && <PolicyHistoricData messages={messages} locale={locale} />}

    </section>
  );
}
