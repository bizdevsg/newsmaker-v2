"use client";

import React, { useState } from "react";
import type { Messages } from "@/locales";
import { Button } from "../atoms/Button";

type PivotFibonacciProps = {
    messages: Messages;
};

export function PivotFibonacci({ messages }: PivotFibonacciProps) {
    const pfData = messages.policy.pivotFibonacci;
    const [subTab, setSubTab] = useState<"pivot" | "fibonacci">("pivot");

    // --- State: Pivot ---
    const [pivotInputs, setPivotInputs] = useState({ open: "", high: "", low: "", close: "" });
    const [pivotResults, setPivotResults] = useState({
        classic: { r4: 0, r3: 0, r2: 0, r1: 0, p: 0, s1: 0, s2: 0, s3: 0, s4: 0 },
        woodie: { r4: 0, r3: 0, r2: 0, r1: 0, p: 0, s1: 0, s2: 0, s3: 0, s4: 0 },
        camarilla: { r4: 0, r3: 0, r2: 0, r1: 0, p: 0, s1: 0, s2: 0, s3: 0, s4: 0 },
    });

    const calculatePivot = () => {
        const o = parseFloat(pivotInputs.open) || 0;
        const h = parseFloat(pivotInputs.high) || 0;
        const l = parseFloat(pivotInputs.low) || 0;
        const c = parseFloat(pivotInputs.close) || 0;
        if (h === 0 && l === 0 && c === 0) return;

        const range = h - l;

        // Classic
        const cp = (h + l + c) / 3;
        const cr1 = (2 * cp) - l;
        const cs1 = (2 * cp) - h;
        const cr2 = cp + range;
        const cs2 = cp - range;
        const cr3 = h + 2 * (cp - l);
        const cs3 = l - 2 * (h - cp);
        const cr4 = cr3 + range;
        const cs4 = cs3 - range;

        // Woodie
        const wp = (h + l + 2 * c) / 4;
        const wr1 = (2 * wp) - l;
        const ws1 = (2 * wp) - h;
        const wr2 = wp + range;
        const ws2 = wp - range;
        const wr3 = h + 2 * (wp - l);
        const ws3 = l - 2 * (h - wp);
        const wr4 = wr3 + range;
        const ws4 = ws3 - range;

        // Camarilla
        const camP = (h + l + c) / 3;
        const camR4 = c + range * 1.1 / 2;
        const camR3 = c + range * 1.1 / 4;
        const camR2 = c + range * 1.1 / 6;
        const camR1 = c + range * 1.1 / 12;
        const camS1 = c - range * 1.1 / 12;
        const camS2 = c - range * 1.1 / 6;
        const camS3 = c - range * 1.1 / 4;
        const camS4 = c - range * 1.1 / 2;

        setPivotResults({
            classic: { r4: cr4, r3: cr3, r2: cr2, r1: cr1, p: cp, s1: cs1, s2: cs2, s3: cs3, s4: cs4 },
            woodie: { r4: wr4, r3: wr3, r2: wr2, r1: wr1, p: wp, s1: ws1, s2: ws2, s3: ws3, s4: ws4 },
            camarilla: { r4: camR4, r3: camR3, r2: camR2, r1: camR1, p: camP, s1: camS1, s2: camS2, s3: camS3, s4: camS4 },
        });
    };

    // --- State: Fibo Up ---
    const [fiboUpInputs, setFiboUpInputs] = useState({ low: "", high: "" });
    const [fiboUpResults, setFiboUpResults] = useState({
        retracement: { "23.60%": 0, "38.20%": 0, "50.0%": 0, "61.80%": 0, "78.60%": 0 },
        projection: { "138.20%": 0, "150.00%": 0, "161.80%": 0, "200.00%": 0, "238.20%": 0, "261.80%": 0 }
    });

    const calculateFiboUp = () => {
        const l = parseFloat(fiboUpInputs.low) || 0;
        const h = parseFloat(fiboUpInputs.high) || 0;
        if (l === 0 && h === 0) return;
        const diff = h - l;

        setFiboUpResults({
            retracement: {
                "23.60%": h - 0.236 * diff,
                "38.20%": h - 0.382 * diff,
                "50.0%": h - 0.5 * diff,
                "61.80%": h - 0.618 * diff,
                "78.60%": h - 0.786 * diff,
            },
            projection: {
                "138.20%": h + 0.382 * diff,
                "150.00%": h + 0.5 * diff,
                "161.80%": h + 0.618 * diff,
                "200.00%": h + 1.0 * diff,
                "238.20%": h + 1.382 * diff,
                "261.80%": h + 1.618 * diff,
            }
        });
    };

    // --- State: Fibo Down ---
    const [fiboDownInputs, setFiboDownInputs] = useState({ high: "", low: "" });
    const [fiboDownResults, setFiboDownResults] = useState({
        retracement: { "78.60%": 0, "61.80%": 0, "50.0%": 0, "38.20%": 0, "23.60%": 0 },
        projection: { "138.20%": 0, "150.00%": 0, "161.80%": 0, "200.00%": 0, "238.20%": 0, "261.80%": 0 }
    });

    const calculateFiboDown = () => {
        const h = parseFloat(fiboDownInputs.high) || 0;
        const l = parseFloat(fiboDownInputs.low) || 0;
        if (h === 0 && l === 0) return;
        const diff = h - l;

        setFiboDownResults({
            retracement: {
                "78.60%": l + 0.786 * diff,
                "61.80%": l + 0.618 * diff,
                "50.0%": l + 0.5 * diff,
                "38.20%": l + 0.382 * diff,
                "23.60%": l + 0.236 * diff,
            },
            projection: {
                "138.20%": l - 0.382 * diff,
                "150.00%": l - 0.5 * diff,
                "161.80%": l - 0.618 * diff,
                "200.00%": l - 1.0 * diff,
                "238.20%": l - 1.382 * diff,
                "261.80%": l - 1.618 * diff,
            }
        });
    };

    const formatNum = (num: number) => {
        if (num === 0) return "0";
        return num.toFixed(3);
    };

    return (
        <div className="mt-8 animate-in fade-in duration-500">
            {/* Sub Navigation */}
            <div className="flex items-center gap-1 border-b border-slate-200 mb-6">
                <button
                    onClick={() => setSubTab("pivot")}
                    className={`px-4 py-3 text-sm font-semibold transition-all relative ${subTab === "pivot"
                        ? "text-blue-700 bg-white"
                        : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                        }`}
                >
                    {pfData.tabs.pivot}
                    {subTab === "pivot" && (
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-700"></div>
                    )}
                    {subTab === "pivot" && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-white"></div>
                    )}
                </button>
                <button
                    onClick={() => setSubTab("fibonacci")}
                    className={`px-4 py-3 text-sm font-semibold transition-all relative ${subTab === "fibonacci"
                        ? "text-blue-700 bg-white"
                        : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                        }`}
                >
                    {pfData.tabs.fibonacci}
                    {subTab === "fibonacci" && (
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-700"></div>
                    )}
                    {subTab === "fibonacci" && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-white"></div>
                    )}
                </button>
                <div className="flex-1 bg-slate-50 border-t border-r border-slate-200 self-stretch rounded-tr-md"></div>
            </div>

            {/* Pivot Tab Content */}
            {subTab === "pivot" && (
                <div className="space-y-8">
                    {/* Inputs */}
                    <div className="grid grid-cols-2 md:flex md:flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[120px]">
                            <label className="sr-only">{pfData.inputs.open}</label>
                            <input
                                type="number"
                                placeholder={pfData.inputs.open}
                                value={pivotInputs.open}
                                onChange={(e) => setPivotInputs({ ...pivotInputs, open: e.target.value })}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                            />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="sr-only">{pfData.inputs.high}</label>
                            <input
                                type="number"
                                placeholder={pfData.inputs.high}
                                value={pivotInputs.high}
                                onChange={(e) => setPivotInputs({ ...pivotInputs, high: e.target.value })}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                            />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="sr-only">{pfData.inputs.low}</label>
                            <input
                                type="number"
                                placeholder={pfData.inputs.low}
                                value={pivotInputs.low}
                                onChange={(e) => setPivotInputs({ ...pivotInputs, low: e.target.value })}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                            />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="sr-only">{pfData.inputs.close}</label>
                            <input
                                type="number"
                                placeholder={pfData.inputs.close}
                                value={pivotInputs.close}
                                onChange={(e) => setPivotInputs({ ...pivotInputs, close: e.target.value })}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1 md:w-auto">
                            <Button onClick={calculatePivot} variant="primary" className="w-full md:w-auto font-medium py-2 px-6">{pfData.inputs.calculate}</Button>
                        </div>
                    </div>

                    {/* Pivot Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-700">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="py-3 px-4 font-bold w-32"></th>
                                    <th className="py-3 px-4 font-bold">{pfData.pivot.columns[0]}</th>
                                    <th className="py-3 px-4 font-bold">{pfData.pivot.columns[1]}</th>
                                    <th className="py-3 px-4 font-bold">{pfData.pivot.columns[2]}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { k: "R4", c: pivotResults.classic.r4, w: pivotResults.woodie.r4, cam: pivotResults.camarilla.r4 },
                                    { k: "R3", c: pivotResults.classic.r3, w: pivotResults.woodie.r3, cam: pivotResults.camarilla.r3 },
                                    { k: "R2", c: pivotResults.classic.r2, w: pivotResults.woodie.r2, cam: pivotResults.camarilla.r2 },
                                    { k: "R1", c: pivotResults.classic.r1, w: pivotResults.woodie.r1, cam: pivotResults.camarilla.r1 },
                                    { k: "Pivot", c: pivotResults.classic.p, w: pivotResults.woodie.p, cam: pivotResults.camarilla.p },
                                    { k: "S1", c: pivotResults.classic.s1, w: pivotResults.woodie.s1, cam: pivotResults.camarilla.s1 },
                                    { k: "S2", c: pivotResults.classic.s2, w: pivotResults.woodie.s2, cam: pivotResults.camarilla.s2 },
                                    { k: "S3", c: pivotResults.classic.s3, w: pivotResults.woodie.s3, cam: pivotResults.camarilla.s3 },
                                    { k: "S4", c: pivotResults.classic.s4, w: pivotResults.woodie.s4, cam: pivotResults.camarilla.s4 },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-slate-800">{row.k}</td>
                                        <td className="py-3 px-4 font-bold">{formatNum(row.c)}</td>
                                        <td className="py-3 px-4 font-bold">{formatNum(row.w)}</td>
                                        <td className="py-3 px-4 font-bold text-slate-600">{formatNum(row.cam)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Fibonacci Tab Content */}
            {subTab === "fibonacci" && (
                <div className="grid lg:grid-cols-2 gap-10">

                    {/* Up Trend Box */}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-6">
                            {/* Graphic Placeholder */}
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-md flex-1 flex flex-col items-center justify-center min-h-[220px]">
                                <h4 className="text-emerald-500 font-extrabold text-xl tracking-tighter mb-4 flex items-center gap-1">
                                    {pfData.fibonacci.upTrend}
                                    <div className="flex -space-x-1">
                                        <i className="fa-solid fa-arrow-up text-emerald-500 text-lg"></i>
                                        <i className="fa-solid fa-arrow-up text-emerald-500 text-lg"></i>
                                        <i className="fa-solid fa-arrow-up text-emerald-500 text-lg"></i>
                                    </div>
                                </h4>
                                <div className="relative w-32 h-24 border-l-2 border-b-2 border-slate-300">
                                    <svg viewBox="0 0 100 100" className="absolute bottom-0 left-0 w-full h-full overflow-visible">
                                        <polyline points="0,100 20,60 40,80 70,20 100,0" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="0" cy="100" r="4" fill="#3b82f6" />
                                        <circle cx="100" cy="0" r="4" fill="#3b82f6" />
                                        <text x="-5" y="115" fontSize="10" fill="#64748b" fontWeight="bold">A</text>
                                        <text x="105" y="-5" fontSize="10" fill="#64748b" fontWeight="bold">C</text>
                                    </svg>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="flex flex-col gap-4 min-w-[180px] w-full sm:w-auto">
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-600 ml-1">{pfData.fibonacci.priceA}</label>
                                    <input
                                        type="number"
                                        placeholder={pfData.fibonacci.lowValue}
                                        value={fiboUpInputs.low}
                                        onChange={(e) => setFiboUpInputs({ ...fiboUpInputs, low: e.target.value })}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-600 ml-1">{pfData.fibonacci.priceB}</label>
                                    <input
                                        type="number"
                                        placeholder={pfData.fibonacci.highValue}
                                        value={fiboUpInputs.high}
                                        onChange={(e) => setFiboUpInputs({ ...fiboUpInputs, high: e.target.value })}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                    />
                                </div>
                                <Button onClick={calculateFiboUp} variant="primary" className="mt-auto py-2.5 px-6 font-medium">{pfData.inputs.calculate}</Button>
                            </div>
                        </div>

                        {/* Fibonacci UP Tables */}
                        <div className="grid grid-cols-2 gap-6">
                            <table className="w-full text-left text-sm border border-slate-200">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr><th colSpan={2} className="py-2.5 px-3 tracking-tight text-slate-800">{pfData.fibonacci.retracement}</th></tr>
                                </thead>
                                <tbody>
                                    {(Object.keys(fiboUpResults.retracement) as Array<keyof typeof fiboUpResults.retracement>).map((pct, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                                            <td className="py-2.5 px-3 text-right">{formatNum(fiboUpResults.retracement[pct])}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <table className="w-full text-left text-sm border border-slate-200">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr><th colSpan={2} className="py-2.5 px-3 tracking-tight text-slate-800">{pfData.fibonacci.projection}</th></tr>
                                </thead>
                                <tbody>
                                    {(Object.keys(fiboUpResults.projection) as Array<keyof typeof fiboUpResults.projection>).map((pct, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                                            <td className="py-2.5 px-3 text-right">{formatNum(fiboUpResults.projection[pct])}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="hidden lg:block border-l border-slate-200 mx-auto w-px h-full absolute left-1/2 -ml-0.5"></div>

                    {/* Down Trend Box */}
                    <div className="space-y-6 lg:pl-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-6">
                            {/* Graphic Placeholder */}
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-md flex-1 flex flex-col items-center justify-center min-h-[220px]">
                                <h4 className="text-red-600 font-extrabold text-xl tracking-tighter mb-4 flex items-center gap-1">
                                    {pfData.fibonacci.downTrend}
                                    <div className="flex -space-x-1">
                                        <i className="fa-solid fa-arrow-down text-red-600 text-lg"></i>
                                        <i className="fa-solid fa-arrow-down text-red-600 text-lg"></i>
                                        <i className="fa-solid fa-arrow-down text-red-600 text-lg"></i>
                                    </div>
                                </h4>
                                <div className="relative w-32 h-24 border-l-2 border-b-2 border-slate-300">
                                    <svg viewBox="0 0 100 100" className="absolute bottom-0 left-0 w-full h-full overflow-visible">
                                        <polyline points="0,0 20,40 40,20 70,80 100,100" fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="0" cy="0" r="4" fill="#3b82f6" />
                                        <circle cx="100" cy="100" r="4" fill="#3b82f6" />
                                        <text x="-5" y="-5" fontSize="10" fill="#64748b" fontWeight="bold">A</text>
                                        <text x="105" y="115" fontSize="10" fill="#64748b" fontWeight="bold">C</text>
                                    </svg>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="flex flex-col gap-4 min-w-[180px] w-full sm:w-auto">
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-600 ml-1">{pfData.fibonacci.priceA}</label>
                                    <input
                                        type="number"
                                        placeholder={pfData.fibonacci.highValue}
                                        value={fiboDownInputs.high}
                                        onChange={(e) => setFiboDownInputs({ ...fiboDownInputs, high: e.target.value })}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-600 ml-1">{pfData.fibonacci.priceB}</label>
                                    <input
                                        type="number"
                                        placeholder={pfData.fibonacci.lowValue}
                                        value={fiboDownInputs.low}
                                        onChange={(e) => setFiboDownInputs({ ...fiboDownInputs, low: e.target.value })}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                    />
                                </div>
                                <Button onClick={calculateFiboDown} variant="primary" className="mt-auto py-2.5 px-6 font-medium">{pfData.inputs.calculate}</Button>
                            </div>
                        </div>

                        {/* Fibonacci DOWN Tables */}
                        <div className="grid grid-cols-2 gap-6">
                            <table className="w-full text-left text-sm border border-slate-200">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr><th colSpan={2} className="py-2.5 px-3 tracking-tight text-slate-800">{pfData.fibonacci.retracement}</th></tr>
                                </thead>
                                <tbody>
                                    {(Object.keys(fiboDownResults.retracement) as Array<keyof typeof fiboDownResults.retracement>).map((pct, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                                            <td className="py-2.5 px-3 text-right">{formatNum(fiboDownResults.retracement[pct])}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <table className="w-full text-left text-sm border border-slate-200">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr><th colSpan={2} className="py-2.5 px-3 tracking-tight text-slate-800">{pfData.fibonacci.projection}</th></tr>
                                </thead>
                                <tbody>
                                    {(Object.keys(fiboDownResults.projection) as Array<keyof typeof fiboDownResults.projection>).map((pct, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                                            <td className="py-2.5 px-3 text-right">{formatNum(fiboDownResults.projection[pct])}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Historical Table and Converter Block (Appears for both modes) */}
            <div className="mt-10 pt-8 border-t border-slate-200 space-y-6">
                <div>
                    <select className="px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none text-slate-700 bg-white min-w-[140px] shadow-sm">
                        <option>LGD Daily</option>
                        <option>LGD Weekly</option>
                    </select>
                </div>

                <div className="overflow-x-auto rounded-md border border-slate-200">
                    <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="py-3 px-4 font-bold tracking-tight text-slate-800">{pfData.historicalData.columns[0]}</th>
                                <th className="py-3 px-4 font-bold tracking-tight text-slate-800">{pfData.historicalData.columns[1]}</th>
                                <th className="py-3 px-4 font-bold tracking-tight text-slate-800">{pfData.historicalData.columns[2]}</th>
                                <th className="py-3 px-4 font-bold tracking-tight text-slate-800">{pfData.historicalData.columns[3]}</th>
                                <th className="py-3 px-4 font-bold tracking-tight text-slate-800">{pfData.historicalData.columns[4]}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { d: "03 Mar 2026", o: "5324.92", h: "5379.73", l: "4996.60", c: "5089.40" },
                                { d: "02 Mar 2026", o: "5343.70", h: "5418.75", l: "5260.90", c: "5332.33" },
                                { d: "27 Feb 2026", o: "5185.55", h: "5265.22", l: "5166.58", c: "5262.21" },
                            ].map((row, idx) => (
                                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4">{row.d}</td>
                                    <td className="py-3 px-4">{row.o}</td>
                                    <td className="py-3 px-4">{row.h}</td>
                                    <td className="py-3 px-4">{row.l}</td>
                                    <td className="py-3 px-4">{row.c}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Currency Converter */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                    <div className="flex items-center gap-2">
                        <select className="px-3 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none shadow-sm">
                            <option>RP</option>
                            <option>USD</option>
                        </select>
                        <input type="text" placeholder={pfData.historicalData.currencyValue} className="px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50 min-w-[160px]" />
                    </div>
                    <span className="font-bold text-slate-400">=</span>
                    <div className="flex items-center gap-2">
                        <select className="px-3 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none shadow-sm">
                            <option>RP</option>
                            <option>USD</option>
                        </select>
                        <input type="text" placeholder={pfData.historicalData.currencyValue} className="px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50 min-w-[160px]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
