"use client";

import React, { useState } from "react";
import type { Messages } from "@/locales";
import { Button } from "../atoms/Button";
import { Pagination } from "../molecules/Pagination";

type PolicyHistoricDataProps = {
    messages: Messages;
};

export function PolicyHistoricData({ messages }: PolicyHistoricDataProps) {
    const data = messages.policy.historicData;
    const [page, setPage] = useState(1);

    const allRows = [
        { d: "03 Mar 2026", o: "5324.92", h: "5379.73", l: "4996.60", c: "5089.40" },
        { d: "02 Mar 2026", o: "5343.70", h: "5418.75", l: "5260.90", c: "5332.33" },
        { d: "27 Feb 2026", o: "5185.55", h: "5265.22", l: "5166.58", c: "5262.21" },
        { d: "26 Feb 2026", o: "5166.25", h: "5205.26", l: "5130.73", c: "5185.85" },
        { d: "25 Feb 2026", o: "5142.74", h: "5217.67", l: "5120.41", c: "5169.11" },
        { d: "24 Feb 2026", o: "5226.94", h: "5249.81", l: "5093.69", c: "5155.34" },
        { d: "23 Feb 2026", o: "5109.58", h: "5237.37", l: "5102.53", c: "5229.86" },
        { d: "20 Feb 2026", o: "4998.50", h: "5098.70", l: "4982.04", c: "5097.68" },
        { d: "19 Feb 2026", o: "4912.20", h: "4999.88", l: "4876.50", c: "4995.10" },
        { d: "18 Feb 2026", o: "4875.30", h: "4930.11", l: "4852.00", c: "4910.45" },
    ];

    const perPage = 5;
    const totalPages = Math.ceil(allRows.length / perPage);
    const rows = allRows.slice((page - 1) * perPage, page * perPage);

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
                        {rows.map((row, idx) => (
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

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="py-2" />

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
