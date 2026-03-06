"use client";

import React, { useState } from "react";
import type { Locale, Messages } from "@/locales";

type CommoditiesMarketOverviewProps = {
    locale: Locale;
    messages: Messages;
};

export function CommoditiesMarketOverview({
    locale,
    messages,
}: CommoditiesMarketOverviewProps) {
    const { marketOverview } = messages.commodities;

    // Set default active tab to "Commodities" (which is index 1)
    const [activeTab, setActiveTab] = useState(marketOverview.tabs[1] || "Commodities");

    return (
        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between border-b-2 border-slate-100 pb-3 mb-4">
                <div className="border-b-2 border-blue-700 pb-3 mb-[-14px] px-1 z-10 w-full sm:w-auto">
                    <h2 className="text-xl font-bold text-blue-900 tracking-tight">
                        {marketOverview.title}
                    </h2>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 transition mt-4 sm:mt-0 tracking-wider">
                    {marketOverview.topLinks.map((link) => (
                        <button key={link} type="button" className="hover:text-blue-700 transition">
                            {link}
                        </button>
                    ))}
                </div>
            </div>

            {/* Render stats conditionally if needed in the future based on activeTab, but currently static */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-md border border-slate-200 mb-6 bg-white overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200 shadow-sm">
                {marketOverview.stats.map((stat, idx) => (
                    <div key={idx} className="p-4 flex flex-col justify-center">
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
                            <div className="text-right">
                                <div
                                    className={`flex items-center justify-end gap-1 font-bold text-sm ${stat.isUp ? "text-emerald-600" : "text-rose-600"
                                        }`}
                                >
                                    <i
                                        className={`fa-solid ${stat.isUp ? "fa-caret-up" : "fa-caret-down"
                                            }`}
                                    ></i>
                                    {stat.value}
                                </div>
                                <div
                                    className={`text-xs font-bold ${stat.change.startsWith("-")
                                            ? "text-rose-600"
                                            : "text-emerald-600"
                                        }`}
                                >
                                    {stat.change}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
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
                <div className="flex gap-3 text-slate-400">
                    <button className="hover:text-blue-700 transition"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                    <button className="hover:text-blue-700 transition"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                    <button className="ml-2 hover:text-blue-700 transition"><i className="fa-solid fa-expand-arrows-alt text-xs"></i></button>
                </div>
            </div>

            <div className="w-full h-[400px] border border-t-0 border-slate-200 bg-white rounded-b-md rounded-tr-md overflow-hidden p-0 shadow-sm relative group flex items-center justify-center">
                {/* Placeholder changes based on active tab to show it's dynamic */}
                {activeTab === marketOverview.tabs[1] ? (
                    <>
                        <img src="/assets/Screenshot-2024-10-29-at-11.27.48.png" className="w-full h-full object-cover opacity-80" alt="Chart Placeholder" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="bg-blue-700 text-white px-6 py-2 rounded-md font-semibold shadow-lg hover:bg-blue-800 transform transition hover:-translate-y-1">View Interactive Chart</button>
                        </div>
                    </>
                ) : (
                    <div className="text-slate-500 font-semibold w-full h-full flex flex-col items-center justify-center bg-slate-50">
                        <i className="fa-solid fa-chart-line text-4xl text-slate-300 mb-3"></i>
                        <p>Data for {activeTab} is currently unavailable</p>
                    </div>
                )}
            </div>
        </section>
    );
}
