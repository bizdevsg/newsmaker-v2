"use client";

import React from "react";
import type { Messages } from "@/locales";

type EquitiesKeySectorsProps = {
    messages: Messages;
};

export function EquitiesKeySectors({ messages }: EquitiesKeySectorsProps) {
    const { keySectors } = messages.equities;

    return (
        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">
                    {keySectors.title}
                </h2>
                <a
                    href="#"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                    {keySectors.viewAll} {">"}
                </a>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {keySectors.items.map((item) => (
                    <div key={item.key} className="group cursor-pointer overflow-hidden rounded-md border border-slate-200 transition-all hover:shadow-md hover:border-blue-200 flex flex-col">
                        <div className="h-32 w-full overflow-hidden bg-slate-100 relative">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://archive.org/download/placeholder-image/placeholder-image.jpg';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="text-sm font-semibold text-blue-900 group-hover:text-blue-600 mb-2 leading-tight">
                                {item.title}
                            </h3>
                            <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                                {item.description}
                            </p>
                            <div className="mt-auto flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                <i className="fa-solid fa-chart-line text-blue-400"></i>
                                {item.indicators}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button className="rounded bg-blue-700 px-6 py-2 text-xs font-semibold text-white shadow hover:bg-blue-800 transition">
                    {messages.common.readMore}
                </button>
            </div>
        </section>
    );
}
