"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../atoms/Button";
import type { Messages } from "@/locales";
import { useLoading } from "../providers/LoadingProvider";

type EquitiesMarketOverviewProps = {
    messages: Messages;
};

type InvestingQuote = {
    symbol: string;
    last: number;
    change: number;
    change_percent: number;
    currency?: string;
};

type InvestingResponse = {
    data?: InvestingQuote[];
    fetched_at?: string;
};

export function EquitiesMarketOverview({ messages }: EquitiesMarketOverviewProps) {
    const { start, stop } = useLoading();
    const { marketOverview } = messages.equities;
    const [rows, setRows] = useState(marketOverview.table.rows);
    const initialLoad = useRef(true);

    const fallbackBySymbol = useMemo(() => {
        return new Map(marketOverview.table.rows.map((row) => [row.sector, row]));
    }, [marketOverview.table.rows]);

    const formatNumber = (value: number, digits = 0) =>
        new Intl.NumberFormat("en-US", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        }).format(value);

    const formatSignedNumber = (value: number, digits = 0) => {
        const sign = value > 0 ? "+" : value < 0 ? "-" : "";
        return `${sign}${formatNumber(Math.abs(value), digits)}`;
    };

    const formatPercent = (value: number) => {
        const sign = value > 0 ? "+" : value < 0 ? "-" : "";
        return `${sign}${Math.abs(value).toFixed(2)}%`;
    };

    useEffect(() => {
        let isActive = true;

        const load = async () => {
            const token = initialLoad.current ? start("equities-overview") : null;
            try {
                const response = await fetch("/api/investing", { cache: "no-store" });
                if (!response.ok) return;
                const payload = (await response.json()) as InvestingResponse;
                if (!isActive || !Array.isArray(payload.data) || payload.data.length === 0) return;

                const nextRows = payload.data.map((item) => {
                    const fallback = fallbackBySymbol.get(item.symbol);
                    return {
                        sector: item.symbol,
                        company: fallback?.company ?? item.symbol,
                        freeFloat: fallback?.freeFloat ?? (item.currency ?? "-"),
                        marketCap: formatNumber(item.last),
                        csRatio: formatPercent(item.change_percent),
                        transVal: formatSignedNumber(item.change),
                    };
                });

                if (nextRows.length) {
                    setRows(nextRows);
                }
            } catch {
                // keep fallback rows
            } finally {
                if (token) stop(token);
                initialLoad.current = false;
            }
        };

        load();

        return () => {
            isActive = false;
        };
    }, [fallbackBySymbol, start, stop]);

    return (
        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-xl font-semibold text-slate-800">
                    {marketOverview.title}
                </h2>
                <select className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500">
                    {marketOverview.tabs.map((tab) => (
                        <option key={tab.key} value={tab.key}>
                            {tab.label}
                        </option>
                    ))}
                </select>
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
                        {rows.map((row, idx) => (
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
