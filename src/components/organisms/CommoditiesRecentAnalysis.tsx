"use client";

import React from "react";
import type { Locale, Messages } from "@/locales";

type CommoditiesRecentAnalysisProps = {
    locale: Locale;
    messages: Messages;
};

export function CommoditiesRecentAnalysis({
    locale,
    messages,
}: CommoditiesRecentAnalysisProps) {
    const { recentAnalysis } = messages.commodities;

    return (
        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-800">
                    {recentAnalysis.title}
                </h3>
                {recentAnalysis.seeAll && (
                    <button
                        type="button"
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 transition flex items-center gap-1 tracking-widest uppercase"
                    >
                        {recentAnalysis.seeAll}
                    </button>
                )}
            </div>

            <div className="px-6 pb-6 pt-4">
                <div className="flex flex-col">
                    {recentAnalysis.items.map((item, index) => (
                        <a
                            href="#"
                            key={index}
                            onClick={(e) => e.preventDefault()}
                            className="py-3 border-b border-slate-100 last:border-b-0 text-blue-900 font-semibold flex items-center justify-between hover:text-blue-800 transition"
                        >
                            <span>- {typeof item === 'string' ? item : item.title}</span> <span>{`>`}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
