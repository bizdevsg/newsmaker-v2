"use client";

import React from "react";
import type { Messages } from "@/locales";

type DataQuickViewProps = {
    messages: Messages;
};

export function DataQuickView({ messages }: DataQuickViewProps) {
    const { quickView } = messages.data;

    return (
        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-6 flex flex-0 items-end justify-between border-b border-slate-200">
                <div className="border-b-2 border-blue-700 pb-3 mb-[-1px] px-1">
                    <h2 className="text-xl font-bold text-blue-900 tracking-tight">
                        {quickView.title}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-6 mb-6 border-b border-slate-200">
                <button className="flex flex-col items-center justify-center rounded-md bg-slate-50/70 p-6 text-center shadow-sm border border-slate-100 transition hover:bg-white hover:shadow-md hover:border-blue-200 group">
                    <div className="mb-4 text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
                        <i className="fa-solid fa-list-check text-4xl"></i>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-900">
                        {quickView.actions.economicCalendar}
                    </span>
                </button>
                <button className="flex flex-col items-center justify-center rounded-md bg-slate-50/70 p-6 text-center shadow-sm border border-slate-100 transition hover:bg-white hover:shadow-md hover:border-blue-200 group">
                    <div className="mb-4 text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
                        <i className="fa-solid fa-square-poll-vertical text-4xl"></i>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-900">
                        {quickView.actions.marketData}
                    </span>
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {quickView.table.map((row, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                        <img
                            src={`https://flagcdn.com/w40/${row.flag}.png`}
                            alt={row.flag}
                            className="w-10 h-auto outline outline-1 outline-slate-200 rounded-sm shadow-sm"
                        />
                        <div className="flex-1">
                            <span className="font-bold text-slate-800 tracking-tight mr-3 block sm:inline">{row.rate}</span>
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 group-hover:text-blue-700 transition-colors">
                                {row.description}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
