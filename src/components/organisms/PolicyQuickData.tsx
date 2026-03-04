"use client";

import React, { useState } from "react";
import type { Messages } from "@/locales";
import { PivotFibonacci } from "./PivotFibonacci";
import { PolicyHistoricData } from "./PolicyHistoricData";

type PolicyQuickDataProps = {
    messages: Messages;
};

export function PolicyQuickData({ messages }: PolicyQuickDataProps) {
    const { quickData } = messages.policy;
    const [activeTab, setActiveTab] = useState(quickData.tabs[0].key);

    return (
        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100 mb-8 mt-2">
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
                <div className="overflow-x-auto animate-in fade-in duration-500">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-tl-md">Time/Date</th>
                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event</th>
                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actual</th>
                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Forecast</th>
                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right rounded-tr-md">Previous</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quickData.economicCalendar.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition">
                                    <td className="py-4 px-4 whitespace-nowrap hidden sm:table-cell">
                                        <span className="font-semibold text-blue-900 text-[13px]">{item.time}</span>
                                    </td>
                                    <td className="py-4 px-4 font-medium text-slate-700 group cursor-pointer inline-flex items-center gap-3">
                                        <img src={`https://flagcdn.com/w20/${item.flag}.png`} alt={item.flag} className="w-5 h-auto rounded-sm outline outline-1 outline-slate-200 shadow-sm block" />
                                        <span className="group-hover:text-blue-600 transition-colors text-[13px]">{item.event}</span>
                                    </td>
                                    <td className="py-4 px-4 text-right font-semibold text-emerald-600 tabular-nums text-[13px]">
                                        {item.actual}
                                    </td>
                                    <td className="py-4 px-4 text-right text-slate-600 tabular-nums text-[13px]">{item.forecast}</td>
                                    <td className="py-4 px-4 text-right text-slate-400 tabular-nums text-[13px]">{item.previous}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === "fibonacci" && (
                <PivotFibonacci messages={messages} />
            )}

            {activeTab === "liveChart" && (
                <div className="py-20 mt-8 text-center text-slate-500 bg-slate-50/50 rounded-lg border border-slate-100 border-dashed flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
                    <i className="fa-solid fa-chart-line text-5xl text-blue-400"></i>
                    <p className="font-semibold text-lg text-slate-700">{quickData.actions.liveChart}</p>
                </div>
            )}

            {activeTab === "historic" && (
                <PolicyHistoricData messages={messages} />
            )}
        </section>
    );
}
