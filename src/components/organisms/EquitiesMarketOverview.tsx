import React from "react";
import { Button } from "../atoms/Button";
import type { Messages } from "@/locales";

type EquitiesMarketOverviewProps = {
    messages: Messages;
};

export function EquitiesMarketOverview({ messages }: EquitiesMarketOverviewProps) {
    const { marketOverview } = messages.equities;

    return (
        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-xl font-semibold text-slate-800">
                    {marketOverview.title}
                </h2>
                <div className="flex items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {marketOverview.tabs.map((tab, idx) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`transition-colors hover:text-blue-600 ${idx === 0 ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "pb-1"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <select className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500">
                        {marketOverview.tabs.map((tab) => (
                            <option key={tab.key} value={tab.key}>
                                {tab.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead>
                        <tr className="border-b border-slate-200 uppercase text-xs tracking-wider text-slate-400">
                            {marketOverview.table.columns.map((col, idx) => (
                                <th key={idx} className="pb-3 font-semibold px-2 first:px-0">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {marketOverview.table.rows.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                <td className="py-4 px-2 first:px-0 font-medium text-slate-800">
                                    {row.sector}
                                </td>
                                <td className="py-4 px-2 tracking-wide">{row.company}</td>
                                <td className="py-4 px-2 font-medium text-emerald-600">{row.freeFloat}</td>
                                <td className="py-4 px-2">{row.marketCap}</td>
                                <td className="py-4 px-2">{row.csRatio}</td>
                                <td className="py-4 px-2">{row.transVal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex justify-center">
                <Button variant="primary" className="px-8 bg-blue-700 hover:bg-blue-800 text-white rounded-md shadow-sm">
                    {marketOverview.table.viewFullUpdates}
                </Button>
            </div>
        </section>
    );
}
