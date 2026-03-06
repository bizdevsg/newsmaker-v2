"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Pagination } from "../molecules/Pagination";

type NewsCategoryListProps = {
    categorySlug: string;
    locale: string;
};

const NEWS_API = "https://portalnews.newsmaker.id/api/v1/berita";
const NEWS_TOKEN = "Bearer EWF-06433b884f930161";
const IMAGE_BASE = "https://portalnews.newsmaker.id/";

// Map slugs to category IDs
const SLUG_TO_IDS: Record<string, number[]> = {
    "gold": [1],
    "silver": [3],
    "oil": [6],
    "nikkei": [2],
    "hang-seng": [10],
    "crypto": [4, 5],
    "eurusd": [7],
    "usdjpy": [12],
    "usdchf": [13],
    "audusd": [9],
    "gbpusd": [11],
    "us-dollar": [14],
    "market-update": [15],
    // Economic News
    "economy": [],           // fallback: match by kategori slug containing 'global' or 'economy'
    "fiscal-moneter": [],    // fallback: match by kategori slug containing 'fiscal' or 'moneter'
    "global-economics": [],
    "fiscal-monetary": [],
};

// Keywords used to fuzzy-match articles when no direct ID mapping exists
const SLUG_KEYWORDS: Record<string, string[]> = {
    "economy": ["global", "economy", "global-economics", "ekonomi"],
    "fiscal-moneter": ["fiscal", "moneter", "monetary", "fiskal"],
    "fiscal-monetary": ["fiscal", "moneter", "monetary"],
};

// Friendly display name per slug
const SLUG_TO_LABEL: Record<string, string> = {
    "gold": "Gold",
    "silver": "Silver",
    "oil": "Oil",
    "nikkei": "Nikkei Index",
    "hang-seng": "Hang Seng Index",
    "crypto": "Crypto",
    "eurusd": "EUR / USD",
    "usdjpy": "USD / JPY",
    "usdchf": "USD / CHF",
    "audusd": "AUD / USD",
    "gbpusd": "GBP / USD",
    "us-dollar": "US Dollar",
    "market-update": "Market Update",
    "economy": "Global & Economy",
    "fiscal-moneter": "Fiscal & Monetary",
    "global-economics": "Global & Economy",
    "fiscal-monetary": "Fiscal & Monetary",
};

// Economic news slugs - these link back to /economic-news
const ECONOMIC_SLUGS = new Set(["economy", "fiscal-moneter", "fiscal-monetary", "global-economics"]);

// Strip HTML helper
const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
};

export function NewsCategoryList({ categorySlug, locale }: NewsCategoryListProps) {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const perPage = 16;

    const label = SLUG_TO_LABEL[categorySlug] ?? categorySlug;
    const targetIds = SLUG_TO_IDS[categorySlug] ?? [];
    const keywords = SLUG_KEYWORDS[categorySlug] ?? [];
    const isEconomic = ECONOMIC_SLUGS.has(categorySlug);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch(NEWS_API, { headers: { Authorization: NEWS_TOKEN } });
                const json = await res.json();
                if (json?.data) {
                    let filtered: any[] = [];
                    if (targetIds.length > 0) {
                        // Direct ID match
                        filtered = json.data.filter((item: any) => targetIds.includes(item.category_id));
                    } else if (keywords.length > 0) {
                        // Fuzzy keyword match against category slug/name
                        filtered = json.data.filter((item: any) => {
                            const catSlug = (item.kategori?.slug ?? "").toLowerCase();
                            const catName = (item.kategori?.name ?? "").toLowerCase();
                            return keywords.some(kw => catSlug.includes(kw) || catName.includes(kw));
                        });
                    } else {
                        // Fallback: match by exact slug
                        filtered = json.data.filter((item: any) => item.kategori?.slug === categorySlug);
                    }
                    // Sort by most recent
                    filtered.sort((a: any, b: any) => {
                        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
                    });
                    setArticles(filtered);
                }
            } catch (err) {
                console.error("Failed to fetch articles", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [categorySlug]);

    const [copiedId, setCopiedId] = useState<number | string | null>(null);

    const copyLink = (slug: string, id: number | string) => {
        const url = `https://portalnews.newsmaker.id/${slug}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(() => {
            const ta = document.createElement("textarea");
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const totalPages = Math.ceil(articles.length / perPage);
    const paginated = articles.slice((page - 1) * perPage, page * perPage);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <i className="fa-solid fa-spinner fa-spin text-3xl mb-4"></i>
                <p className="text-sm font-semibold">Loading articles...</p>
            </div>
        );
    }

    if (articles.length === 0) {
        return (
            <div className="text-center py-24">
                <i className="fa-solid fa-newspaper text-4xl text-slate-200 mb-4"></i>
                <p className="text-slate-500 font-semibold">No articles found for "{label}"</p>
                <Link href={`/${locale}/equities`} className="mt-4 inline-block text-sm text-blue-600 hover:underline">
                    ← Back to News Categories
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Category Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <Link href={`/${locale}/equities`} className="hover:text-blue-600 transition">
                        {isEconomic ? "Economic News" : "Market News"}
                    </Link>
                    <span>/</span>
                    <span className="text-slate-700 font-semibold">{label}</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">{label}</h1>
                <p className="text-slate-500 mt-2 text-sm">{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Article Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginated.map((item, idx) => {
                    const thumb = item.images?.[0] ? `${IMAGE_BASE}${item.images[0]}` : null;
                    const title = item.titles?.default || item.title;
                    const summary = stripHtml(item.content ?? "").substring(0, 140);
                    const date = new Date(item.updated_at || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    const catName = item.kategori?.name?.toUpperCase() ?? label.toUpperCase();

                    return (
                        <div
                            key={item.id ?? idx}
                            className="group flex flex-col rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 overflow-hidden transition-all duration-300"
                        >
                            {/* Thumbnail */}
                            <div className="relative h-48 overflow-hidden bg-slate-100 shrink-0">
                                {thumb ? (
                                    <img
                                        src={thumb}
                                        alt={title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://archive.org/download/placeholder-image/placeholder-image.jpg";
                                        }}
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-blue-100 to-slate-200 flex items-center justify-center">
                                        <i className="fa-solid fa-newspaper text-slate-300 text-3xl"></i>
                                    </div>
                                )}
                                {/* Category badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="rounded-sm bg-blue-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                        {catName}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col flex-1 p-4">
                                <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-3 mb-3 group-hover:text-blue-700 transition">
                                    {title}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">
                                    {summary}...
                                </p>

                                {/* Date & CTA */}
                                <div className="mt-auto">
                                    <p className="text-[10px] text-slate-400 mb-3">{date}</p>
                                    <Link
                                        href={`/${locale}/${isEconomic ? "economic-news" : "news"}/${categorySlug}/${item.slug ?? ""}`}
                                        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
                                    >
                                        READ MORE
                                    </Link>
                                    {/* Social share row */}
                                    {(() => {
                                        const articleUrl = `https://portalnews.newsmaker.id/${item.slug ?? ""}`;
                                        const encodedUrl = encodeURIComponent(articleUrl);
                                        const encodedTitle = encodeURIComponent(title);
                                        const waUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
                                        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                                        const xUrl = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                                        const isCopied = copiedId === (item.id ?? idx);

                                        return (
                                            <div className="flex items-center gap-2.5 mt-3">
                                                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                                                    title="Share to WhatsApp"
                                                    className="text-slate-400 hover:text-green-500 transition text-sm">
                                                    <i className="fa-brands fa-whatsapp"></i>
                                                </a>
                                                <a href={fbUrl} target="_blank" rel="noopener noreferrer"
                                                    title="Share to Facebook"
                                                    className="text-slate-400 hover:text-blue-600 transition text-sm">
                                                    <i className="fa-brands fa-facebook"></i>
                                                </a>
                                                <a href={xUrl} target="_blank" rel="noopener noreferrer"
                                                    title="Share to X"
                                                    className="text-slate-400 hover:text-slate-800 transition text-sm">
                                                    <i className="fa-brands fa-x-twitter"></i>
                                                </a>
                                                <button
                                                    onClick={() => copyLink(item.slug ?? "", item.id ?? idx)}
                                                    title="Copy link"
                                                    className={`text-sm transition ${isCopied ? "text-blue-600" : "text-slate-400 hover:text-blue-500"}`}
                                                >
                                                    <i className={`fa-solid ${isCopied ? "fa-check" : "fa-link"}`}></i>
                                                </button>
                                                {isCopied && (
                                                    <span className="text-[10px] text-blue-600 font-semibold animate-in fade-in">Copied!</span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Pagination */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                scrollTop
                className="mt-10"
            />
        </div>
    );
}
