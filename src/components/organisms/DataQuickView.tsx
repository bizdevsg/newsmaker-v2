"use client";

import React, { useState, useEffect } from "react";
import type { Messages, Locale } from "@/locales";
import Link from "next/link";
import { useLoading } from "../providers/LoadingProvider";

type DataQuickViewProps = {
    locale: Locale | string;
    messages: Messages;
};

const ENDPOAPI_BASE = process.env.NEXT_PUBLIC_ENDPOAPI_BASE ?? "";

export function DataQuickView({ locale, messages }: DataQuickViewProps) {
    const loading = useLoading();
    const [calendarData, setCalendarData] = useState<any[]>([]);

    useEffect(() => {
        const fetchCalendar = async () => {
            const token = loading.start("data-quick-view");
            try {
                const res = await fetch(`${ENDPOAPI_BASE}/api/calendar/today`);
                const json = await res.json();
                if (json && json.data) {
                    setCalendarData(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch calendar", error);
            } finally {
                loading.stop(token);
            }
        };
        fetchCalendar();
    }, []);

    return (
        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4 border-b border-white pb-1">
                <div className="px-3 font-bold py-1.5 text-[15px] font-semibold rounded-sm">
                    {messages?.widgets?.dataQuickView?.title || (locale === "id" ? "Kalender Ekonomi" : "Economic Calendar")}
                </div>
                <Link href={`/${locale}/policy`} className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition">
                    {messages?.widgets?.dataQuickView?.cta || (locale === "id" ? "Lihat Selengkapnya" : "View More")}
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-100 z-10">
                        <tr>
                            <th className="py-2 px-2 text-[13px] font-bold text-slate-800">{messages?.widgets?.dataQuickView?.columns?.time || (locale === "id" ? "Waktu" : "Time")}</th>
                            <th className="py-2 px-2 text-[13px] font-bold text-slate-800">{messages?.widgets?.dataQuickView?.columns?.country || (locale === "id" ? "Negara" : "Country")}</th>
                            <th className="py-2 px-2 text-[13px] font-bold text-slate-800">{messages?.widgets?.dataQuickView?.columns?.figures || (locale === "id" ? "Angka" : "Figures")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calendarData.map((item, idx, list) => {
                            const extractDate = (value?: string) => {
                                if (!value) return "";
                                const trimmed = value.trim();
                                if (trimmed.includes(" ")) {
                                    return trimmed.split(" ")[0];
                                }
                                return trimmed;
                            };

                            const currentDate = extractDate(item.date) || extractDate(item.time);
                            const prevItem = list[idx - 1];
                            const prevDate = prevItem
                                ? extractDate(prevItem.date) || extractDate(prevItem.time)
                                : "";
                            const showSeparator = idx !== 0 && currentDate && currentDate !== prevDate;

                            return (
                                <React.Fragment key={idx}>
                                    {showSeparator ? (
                                        <tr>
                                            <td colSpan={3} className="bg-slate-100 py-2 px-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[11px] font-semibold text-slate-500">
                                                        {currentDate}
                                                    </span>
                                                    <div className="h-px flex-1 bg-slate-200" />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : null}
                                    <tr className="border-b border-slate-200 last:border-0 align-top">
                                        <td className="py-3 px-2">
                                            <div className="font-medium text-[13px] text-slate-800 tracking-tight leading-tight mb-1">
                                                {item.time || "-"}
                                            </div>
                                            <div className={`text-[10px] space-x-0.5 ${item.impact === "?????????" ? "text-rose-500" : item.impact === "??????" ? "text-amber-500" : "text-emerald-500"}`}>
                                                {item.impact === "?????????" && <><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></>}
                                                {item.impact === "??????" && <><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></>}
                                                {item.impact === "???" && <i className="fa-solid fa-star"></i>}
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 font-medium text-[13px] text-slate-800">
                                            {item.currency}
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="font-bold text-[13px] text-slate-800 mb-1 leading-tight">
                                                {item.event}
                                            </div>
                                            <div className="text-[12px] text-slate-500 gap-2 inline-flex flex-wrap leading-tight">
                                                {item.previous && <span>Prev: <span className="text-slate-500">{item.previous}</span></span>}
                                                {item.forecast && <span>Fore: <span className="text-slate-500">{item.forecast}</span></span>}
                                                {item.actual && (
                                                    <span className="flex items-center gap-1">
                                                        Act: <span className={`font-bold ${item.actual.includes("-") ? "text-rose-500" : "text-emerald-500"}`}>{item.actual}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #94a3b8;
                    border-radius: 4px;
                }
            `}} />
        </section>
    );
}
