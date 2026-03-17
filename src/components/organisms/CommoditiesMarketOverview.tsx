"use client";

import React, { useState, useEffect, useRef } from "react";
import TradingViewWidget from "./TradingViewWidget";
import type { Locale, Messages } from "@/locales";
import { useLoading } from "../providers/LoadingProvider";

type CommoditiesMarketOverviewProps = {
    locale: Locale;
    messages: Messages;
};


export function CommoditiesMarketOverview({
    locale,
    messages,
}: CommoditiesMarketOverviewProps) {
    const loading = useLoading();
    const { marketOverview } = messages.commodities;

    // Set default active tab to "Commodities" (which is index 1)
    const [activeTab, setActiveTab] = useState(marketOverview.tabs[1] || "Commodities");
    const [liveStats, setLiveStats] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchQuotes = async () => {
            const token = loading.start("commodities-overview");
            try {
                const res = await fetch(`/api/live-quotes`);
                const json = await res.json();
                if (json && json.data) {
                    const mappedStats = json.data.map((item: any) => {
                        let title = item.symbol;
                        let subtitle = item.symbol;
                        let icon = "fa-brands fa-bitcoin";
                        let iconColor = "text-yellow-500";

                        if (item.symbol === "XUL10") {
                            title = "Gold Spot"; subtitle = "XAU/USD";
                        } else if (item.symbol === "BCO10_BBJ") {
                            title = "Brent Crude Oil"; subtitle = "BCO/USD";
                            iconColor = "text-slate-800"; icon = "fa-solid fa-droplet";
                        } else if (item.symbol === "HKK50_BBJ") {
                            title = "Hang Seng"; subtitle = "HKK50";
                            iconColor = "text-red-500"; icon = "fa-solid fa-chart-pie";
                        } else if (item.symbol === "JPK50_BBJ") {
                            title = "Nikkei"; subtitle = "JPK50";
                            iconColor = "text-red-500"; icon = "fa-solid fa-chart-pie";
                        } else if (item.symbol === "AU10F_BBJ") {
                            title = "AUD/USD"; subtitle = "Forex";
                            iconColor = "text-blue-500"; icon = "fa-solid fa-coins";
                        } else if (item.symbol === "EU10F_BBJ") {
                            title = "EUR/USD"; subtitle = "Forex";
                            iconColor = "text-blue-500"; icon = "fa-solid fa-coins";
                        } else if (item.symbol === "GU10F_BBJ") {
                            title = "GBP/USD"; subtitle = "Forex";
                            iconColor = "text-blue-500"; icon = "fa-solid fa-coins";
                        } else if (item.symbol === "UC10F_BBJ") {
                            title = "USD/CHF"; subtitle = "Forex";
                            iconColor = "text-blue-500"; icon = "fa-solid fa-coins";
                        } else if (item.symbol === "UJ10F_BBJ") {
                            title = "USD/JPY"; subtitle = "Forex";
                            iconColor = "text-blue-500"; icon = "fa-solid fa-coins";
                        }

                        return {
                            title,
                            subtitle,
                            value: item.price.toString(),
                            change: `${item.percentChange > 0 ? "+" : ""}${item.percentChange.toFixed(2)}%`,
                            isUp: item.percentChange >= 0,
                            icon,
                            iconColor
                        };
                    });

                    if (mappedStats.length > 0) {
                        setLiveStats(mappedStats);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch live quotes", err);
            } finally {
                loading.stop(token);
            }
        };
        fetchQuotes();
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            scrollRef.current.scrollTo({
                left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const displayStats = liveStats.length > 0 ? liveStats : marketOverview.stats;

    const getTradingViewSymbol = (tab: string) => {
        const t = tab.toLowerCase();
        if (t.includes("market") || t.includes("pasar")) return "IDX:COMPOSITE";
        if (t.includes("equit") || t.includes("ekuit")) return "IDX:BBCA";
        if (t.includes("forex")) return "FX:EURUSD";
        if (t.includes("crypto") || t.includes("kripto")) return "BINANCE:BTCUSDT";
        return "OANDA:XAUUSD"; // commodities default
    };

    return (
        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between border-b-2 border-slate-100 pb-3 mb-4">
                <div className="border-b-2 border-blue-700 pb-3 mb-[-14px] px-1 z-10 w-full sm:w-auto">
                    <h2 className="text-xl font-bold text-blue-900 tracking-tight">
                        {marketOverview.title}
                    </h2>
                </div>
            </div>

            {/* Render stats mapped as cards in an overarching scroll container */}
            <div className="relative mb-6">
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x"
                >
                    {displayStats.map((stat: any, idx: number) => (
                        <div key={idx} className="flex-none w-[260px] p-4 flex flex-col justify-center rounded-md border border-slate-200 bg-white shadow-sm snap-start">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {stat.icon ? (
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 ${stat.iconColor}`}
                                        >
                                            <i className={`${stat.icon} text-lg`}></i>
                                        </div>
                                    ) : (
                                        <div />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                                            {stat.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-bold tracking-wide uppercase">
                                            {stat.subtitle}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div
                                        className={`flex items-center gap-1 font-bold text-sm ${stat.isUp ? "text-emerald-600" : "text-rose-600"
                                            }`}
                                    >
                                        {stat.value}
                                    </div>
                                    <div
                                        className={`text-xs font-bold mt-1 ${stat.change.startsWith("-")
                                            ? "text-rose-600"
                                            : "text-emerald-600"
                                            }`}
                                    >
                                        <i
                                            className={`fa-solid ${stat.isUp ? "fa-caret-up" : "fa-caret-down"} mr-1`}
                                        ></i>
                                        {stat.change}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Scroll controls */}
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onClick={() => scroll("left")}
                        className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition shadow-sm"
                    >
                        <i className="fa-solid fa-chevron-left text-xs"></i>
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition shadow-sm"
                    >
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                </div>
            </div>

            <div className="mb-0 flex items-center justify-between border-b border-slate-200">
                <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                    {marketOverview.tabs.map((tab) => {
                        return (
                            <button
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                key={tab}
                                className={`px-6 py-3 text-sm font-bold tracking-wide transition-colors whitespace-nowrap block ${activeTab === tab
                                    ? "bg-blue-800 text-white rounded-t-md shadow-sm"
                                    : "bg-slate-50 text-slate-600 hover:text-blue-800 hover:bg-slate-100 rounded-t-md border border-b-0 border-slate-200"
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
                <div className="flex gap-3 text-slate-400 items-center">
                    <button className="ml-2 hover:text-blue-700 transition" title="Expand Chart"><i className="fa-solid fa-expand-arrows-alt text-sm"></i></button>
                </div>
            </div>

            <div className="w-full h-[400px] border border-t-0 border-slate-200 bg-white rounded-b-md rounded-tr-md overflow-hidden p-0 shadow-sm relative group flex items-center justify-center">
                <div className="w-full h-full pb-8">
                    <TradingViewWidget symbol={getTradingViewSymbol(activeTab)} />
                </div>
            </div>
        </section>
    );
}
