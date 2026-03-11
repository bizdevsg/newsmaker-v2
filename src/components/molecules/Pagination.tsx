"use client";

import React from "react";

type PaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
    scrollTop?: boolean;
    className?: string;
};

export function Pagination({
    page,
    totalPages,
    onPageChange,
    scrollTop = false,
    className = "",
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const handlePage = (p: number) => {
        onPageChange(p);
        if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const WINDOW = 5;
    const half = Math.floor(WINDOW / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + WINDOW - 1);
    if (end - start < WINDOW - 1) start = Math.max(1, end - WINDOW + 1);

    const btnBase =
        "w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition";
    const btnInactive =
        "border border-slate-200 text-slate-600 hover:bg-slate-50";
    const btnActive =
        "bg-blue-700 text-white shadow-sm shadow-blue-200";

    const items: React.ReactNode[] = [];

    // First page + left ellipsis
    if (start > 1) {
        items.push(
            <button key={1} onClick={() => handlePage(1)} className={`${btnBase} ${btnInactive}`}>
                1
            </button>
        );
        if (start > 2)
            items.push(
                <span key="l-ellipsis" className="px-1 text-slate-400 text-xs font-bold select-none">
                    …
                </span>
            );
    }

    // Window
    for (let p = start; p <= end; p++) {
        items.push(
            <button
                key={p}
                onClick={() => handlePage(p)}
                className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
            >
                {p}
            </button>
        );
    }

    // Right ellipsis + last page
    if (end < totalPages) {
        if (end < totalPages - 1)
            items.push(
                <span key="r-ellipsis" className="px-1 text-slate-400 text-xs font-bold select-none">
                    …
                </span>
            );
        items.push(
            <button key={totalPages} onClick={() => handlePage(totalPages)} className={`${btnBase} ${btnInactive}`}>
                {totalPages}
            </button>
        );
    }

    return (
        <div className={`flex justify-center items-center gap-1.5 flex-wrap ${className}`}>
            {/* Prev */}
            <button
                onClick={() => handlePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-xs font-semibold border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition"
            >
                <i className="fa-solid fa-chevron-left text-[10px]"></i> Prev
            </button>

            {items}

            {/* Next */}
            <button
                onClick={() => handlePage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-xs font-semibold border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition"
            >
                Next <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
        </div>
    );
}
