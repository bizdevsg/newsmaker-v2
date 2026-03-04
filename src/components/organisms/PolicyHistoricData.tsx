"use client";

import React from "react";
import type { Messages } from "@/locales";
import { Button } from "../atoms/Button";

type PolicyHistoricDataProps = {
    messages: Messages;
};

export function PolicyHistoricData({ messages }: PolicyHistoricDataProps) {
    const data = messages.policy.historicData;

    const mockData = [
        { d: "03 Mar 2026", o: "5324.92", h: "5379.73", l: "4996.60", c: "5089.40" },
        { d: "02 Mar 2026", o: "5343.70", h: "5418.75", l: "5260.90", c: "5332.33" },
        { d: "27 Feb 2026", o: "5185.55", h: "5265.22", l: "5166.58", c: "5262.21" },
        { d: "26 Feb 2026", o: "5166.25", h: "5205.26", l: "5130.73", c: "5185.85" },
        { d: "25 Feb 2026", o: "5142.74", h: "5217.67", l: "5120.41", c: "5169.11" },
        { d: "24 Feb 2026", o: "5226.94", h: "5249.81", l: "5093.69", c: "5155.34" },
        { d: "23 Feb 2026", o: "5109.58", h: "5237.37", l: "5102.53", c: "5229.86" },
        { d: "20 Feb 2026", o: "4998.50", h: "5098.70", l: "4982.04", c: "5097.68" },
    ];

    return (
        <div className="mt-4 animate-in fade-in duration-500 space-y-6">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight pb-4 border-b border-slate-100">
                {data.title}
            </h3>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <select className="px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none text-slate-700 bg-white min-w-[120px] shadow-sm">
                    <option>LGD Daily</option>
                    <option>LGD Weekly</option>
                </select>
                <select className="px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none text-slate-700 bg-white min-w-[100px] shadow-sm">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                </select>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{data.filters.start}</span>
                    <input type="date" className="px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none text-slate-700 shadow-sm min-w-[140px]" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{data.filters.end}</span>
                    <input type="date" className="px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none text-slate-700 shadow-sm min-w-[140px]" />
                </div>

                <Button variant="primary" className="py-2.5 px-6 font-medium bg-blue-700 hover:bg-blue-800 ml-auto md:ml-0">
                    {data.filters.filterBtn}
                </Button>
                <Button variant="primary" className="py-2.5 px-6 font-medium bg-blue-700 hover:bg-blue-800 ml-auto md:ml-0">
                    {data.filters.downloadBtn}
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-sm">
                <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="py-3 px-4 font-bold text-slate-800">{data.columns[0]}</th>
                            <th className="py-3 px-4 font-bold text-slate-800">{data.columns[1]}</th>
                            <th className="py-3 px-4 font-bold text-slate-800">{data.columns[2]}</th>
                            <th className="py-3 px-4 font-bold text-slate-800">{data.columns[3]}</th>
                            <th className="py-3 px-4 font-bold text-slate-800">{data.columns[4]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockData.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 px-4 font-medium">{row.d}</td>
                                <td className="py-3.5 px-4 tabular-nums">{row.o}</td>
                                <td className="py-3.5 px-4 tabular-nums">{row.h}</td>
                                <td className="py-3.5 px-4 tabular-nums">{row.l}</td>
                                <td className="py-3.5 px-4 tabular-nums">{row.c}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 py-4">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 transition">
                    <i className="fa-solid fa-angles-left text-[10px]"></i>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 transition">
                    <i className="fa-solid fa-angle-left text-[10px]"></i>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 text-white font-bold text-sm">
                    1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200 font-bold hover:border-blue-600 transition text-sm">
                    2
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200 font-bold hover:border-blue-600 transition text-sm">
                    3
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200 font-bold hover:border-blue-600 transition text-sm">
                    4
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200 hover:border-blue-600 transition">
                    <i className="fa-solid fa-angle-right text-[10px]"></i>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200 hover:border-blue-600 transition">
                    <i className="fa-solid fa-angles-right text-[10px]"></i>
                </button>
            </div>

            {/* Currency Converter */}
            <div className="flex flex-wrap items-center gap-4 pt-4 mt-2">
                <div className="flex items-center gap-2">
                    <select className="px-3 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none shadow-sm">
                        <option>RP</option>
                        <option>USD</option>
                    </select>
                    <input type="text" placeholder={data.currencyValue} className="px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50 min-w-[160px]" />
                </div>
                <span className="font-bold text-slate-400">=</span>
                <div className="flex items-center gap-2">
                    <select className="px-3 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none shadow-sm">
                        <option>RP</option>
                        <option>USD</option>
                    </select>
                    <input type="text" placeholder={data.currencyValue} className="px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50 min-w-[160px]" />
                </div>
            </div>
        </div>
    );
}
