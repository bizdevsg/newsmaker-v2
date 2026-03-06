"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Messages } from "@/locales";
import { PivotFibonacci } from "./PivotFibonacci";
import { PolicyHistoricData } from "./PolicyHistoricData";
import TradingViewWidget from "./TradingViewWidget";

type PolicyQuickDataProps = {
    messages: Messages;
};

export function PolicyQuickData({ messages }: PolicyQuickDataProps) {
    const { quickData } = messages.policy;
    const [activeTab, setActiveTab] = useState(quickData.tabs[0].key);

    // Calendar State
    const [calendarTimeFrame, setCalendarTimeFrame] = useState<'today' | 'this-week' | 'previous-week' | 'next-week'>('this-week');
    const [calendarData, setCalendarData] = useState<any[]>([]);

    // Live Chart State
    const [liveStats, setLiveStats] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Calendar
    useEffect(() => {
        if (activeTab === 'calendar') {
            const fetchCalendar = async () => {
                try {
                    const res = await fetch(`https://endpoapi-production-3202.up.railway.app/api/calendar/${calendarTimeFrame}`);
                    const json = await res.json();
                    if (json && json.data) {
                        setCalendarData(json.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch calendar", error);
                }
            };
            fetchCalendar();
        }
    }, [activeTab, calendarTimeFrame]);

    // Fetch Live Quotes
    useEffect(() => {
        if (activeTab === 'liveChart') {
            const fetchQuotes = async () => {
                try {
                    const res = await fetch("https://endpoapi-production-3202.up.railway.app/api/live-quotes");
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
                }
            };
            fetchQuotes();
        }
    }, [activeTab]);

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

    return (
        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100 mb-8 mt-2 overflow-hidden min-w-0 w-full relative">
            <div className="mb-6 flex items-end justify-between border-b border-slate-200">
                <div className="border-b-2 border-blue-700 pb-3 mb-[-1px] px-1">
                    <h2 className="text-xl font-bold text-blue-900 tracking-tight">
                        {quickData.title}
                    </h2>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold pb-3 px-1">
                    <button className="hover:text-slate-800 transition">C +</button>
                    <span className="text-slate-200 font-light">|</span>
                    <button className="hover:text-slate-800 transition tracking-widest">SS</button>
                    <span className="text-slate-200 font-light">|</span>
                    <button className="hover:text-slate-800 transition">
                        <i className="fa-solid fa-bars"></i>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("calendar")}
                    className={`flex flex-col items-center justify-center rounded-md py-6 px-2 text-center shadow-sm border transition group ${activeTab === 'calendar' ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-slate-50/70 border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200'}`}>
                    <div className={`mb-4 transition-all duration-300 ${activeTab === 'calendar' ? 'text-blue-600 scale-110' : 'text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110'}`}>
                        <i className="fa-regular fa-circle-check text-4xl"></i>
                    </div>
                    <span className={`text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'calendar' ? 'text-blue-900' : 'text-slate-700 group-hover:text-blue-900'}`}>
                        {quickData.actions.economicCalendar}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("fibonacci")}
                    className={`flex flex-col items-center justify-center rounded-md py-6 px-2 text-center shadow-sm border transition group ${activeTab === 'fibonacci' ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-slate-50/70 border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200'}`}>
                    <div className={`mb-4 transition-all duration-300 ${activeTab === 'fibonacci' ? 'text-blue-600 scale-110' : 'text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110'}`}>
                        <i className="fa-regular fa-calendar-days text-4xl"></i>
                    </div>
                    <span className={`text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'fibonacci' ? 'text-blue-900' : 'text-slate-700 group-hover:text-blue-900'}`}>
                        {quickData.actions.pivotFibonacci}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("liveChart")}
                    className={`flex flex-col items-center justify-center rounded-md py-6 px-2 text-center shadow-sm border transition group ${activeTab === 'liveChart' ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-slate-50/70 border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200'}`}>
                    <div className={`mb-4 transition-all duration-300 ${activeTab === 'liveChart' ? 'text-blue-600 scale-110' : 'text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110'}`}>
                        <i className="fa-solid fa-chart-line text-4xl"></i>
                    </div>
                    <span className={`text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'liveChart' ? 'text-blue-900' : 'text-slate-700 group-hover:text-blue-900'}`}>
                        {quickData.actions.liveChart}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("historic")}
                    className={`flex flex-col items-center justify-center rounded-md py-6 px-2 text-center shadow-sm border transition group ${activeTab === 'historic' ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-slate-50/70 border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200'}`}>
                    <div className={`mb-4 transition-all duration-300 ${activeTab === 'historic' ? 'text-blue-600 scale-110' : 'text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110'}`}>
                        <i className="fa-solid fa-chart-area text-4xl"></i>
                    </div>
                    <span className={`text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'historic' ? 'text-blue-900' : 'text-slate-700 group-hover:text-blue-900'}`}>
                        {quickData.actions.historic}
                    </span>
                </button>
            </div>

            {activeTab === "calendar" && (
                <div className="animate-in fade-in duration-500 w-full overflow-hidden min-w-0">
                    <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar max-w-full">
                        {['today', 'this-week', 'previous-week', 'next-week'].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setCalendarTimeFrame(tf as any)}
                                className={`px-5 py-2 text-sm font-semibold rounded border transition whitespace-nowrap ${calendarTimeFrame === tf ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-700 hover:bg-blue-50'}`}
                            >
                                {tf.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-3 px-2 text-xs font-bold text-slate-800">Date</th>
                                    <th className="py-3 px-2 text-xs font-bold text-slate-800">Time</th>
                                    <th className="py-3 px-2 text-xs font-bold text-slate-800">Country</th>
                                    <th className="py-3 px-2 text-xs font-bold text-slate-800 text-center">Impact</th>
                                    <th className="py-3 px-2 text-xs font-bold text-slate-800">Figures</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calendarData.map((item, idx) => {
                                    let dateStr = "";
                                    let timeStr = item.time;
                                    if (item.time && item.time.includes(" ")) {
                                        const parts = item.time.split(" ");
                                        dateStr = parts[0].split("-").reverse().join("-");
                                        timeStr = parts.slice(1).join(" ");
                                    } else if (item.details?.history?.[0]?.date) {
                                        dateStr = item.details.history[0].date.split("-").reverse().join("-");
                                    }

                                    return (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition align-top">
                                            <td className="py-4 px-2 text-[13px]">{dateStr}</td>
                                            <td className="py-4 px-2 text-[13px]">{timeStr}</td>
                                            <td className="py-4 px-2 text-[13px]">{item.currency}</td>
                                            <td className="py-4 px-2 text-center text-[13px]">
                                                <span className="text-emerald-500 text-[10px] space-x-0.5">
                                                    {item.impact === "★★★" && <><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></>}
                                                    {item.impact === "★★" && <><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></>}
                                                    {item.impact === "★" && <i className="fa-solid fa-star"></i>}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-[13px]">
                                                <div className="font-bold text-slate-800 mb-1">{item.event}</div>
                                                <div className="text-xs text-slate-500 font-semibold gap-1 inline-flex">
                                                    <span>Previous: <span className="text-slate-700 font-medium">{item.previous || '-'}</span></span>
                                                    <span className="mx-1">|</span>
                                                    <span>Forecast: <span className="text-slate-700 font-medium">{item.forecast || '-'}</span></span>
                                                    <span className="mx-1">|</span>
                                                    <span className="flex items-center gap-1">Actual: <span className={`font-bold ${item.actual?.includes("-") ? 'text-rose-500' : 'text-emerald-500'}`}>{item.actual || '-'}</span></span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "fibonacci" && (
                <PivotFibonacci messages={messages} />
            )}

            {activeTab === "liveChart" && (
                <div className="animate-in fade-in duration-500 w-full overflow-hidden min-w-0">
                    {/* Render stats mapped as cards in an overarching scroll container */}
                    <div className="relative mb-6 max-w-full">
                        <div
                            ref={scrollRef}
                            className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x w-full"
                        >
                            {liveStats.map((stat: any, idx: number) => (
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

                    <div className="w-full h-[400px] border border-slate-200 bg-white rounded-md overflow-hidden p-0 shadow-sm relative group flex items-center justify-center">
                        <div className="w-full h-full pb-8">
                            <TradingViewWidget symbol="IDX:COMPOSITE" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "historic" && (
                <PolicyHistoricData messages={messages} />
            )}
        </section>
    );
}
