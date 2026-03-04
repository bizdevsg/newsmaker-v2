"use client";

import React from "react";
import type { Messages } from "@/locales";

type ReportCategoriesProps = {
    messages: Messages;
};

export function ReportCategories({ messages }: ReportCategoriesProps) {
    const { categories } = messages.reportsMenu;

    return (
        <section className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
                {categories.items.map((cat, i) => (
                    <button key={i} className="flex flex-col items-center justify-center rounded-md bg-slate-50/70 p-4 text-center shadow-sm border border-slate-100 transition hover:bg-white hover:shadow-md hover:border-blue-200 group h-full">
                        <div className="mb-3 text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
                            <i className={`fa-solid fa-${cat.icon} text-3xl`}></i>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-blue-900">
                            {cat.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100 mt-2">
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {categories.featured.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {categories.featured.description}
                </p>
                <button className="mt-4 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors uppercase tracking-wider">
                    {messages.common.readMore} <i className="fa-solid fa-arrow-right ml-1"></i>
                </button>
            </div>
        </section>
    );
}
