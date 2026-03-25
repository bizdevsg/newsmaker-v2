"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Pagination } from "../molecules/Pagination";
import { useLoading } from "../providers/LoadingProvider";
import Image from "next/image";

import type { Messages } from "@/locales";

type NewsCategoryListProps = {
  categorySlug: string;
  locale: string;
  emptyLabel?: string;
  messages?: Messages;
};

const NEWS_API = process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ?? "";
const NEWS_TOKEN = process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ?? "";
const IMAGE_BASE = process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE ?? "";

// Map slugs to category IDs
const SLUG_TO_IDS: Record<string, number[]> = {
  gold: [1],
  silver: [3],
  oil: [6],
  nikkei: [2],
  "hang-seng": [10],
  crypto: [],
  eurusd: [7],
  usdjpy: [12],
  usdchf: [13],
  audusd: [9],
  gbpusd: [11],
  "us-dollar": [14],
  "market-update": [15],
  // Economic News
  economy: [], // fallback: match by kategori slug containing 'global' or 'economy'
  "fiscal-moneter": [], // fallback: match by kategori slug containing 'fiscal' or 'moneter'
  "global-economics": [],
  "fiscal-monetary": [],
};

// Keywords used to fuzzy-match articles when no direct ID mapping exists
const SLUG_KEYWORDS: Record<string, string[]> = {
  crypto: ["crypto", "kripto", "bitcoin", "btc", "ethereum", "eth"],
  economy: ["global", "economy", "global-economics", "ekonomi"],
  "fiscal-moneter": ["fiscal", "moneter", "monetary", "fiskal"],
  "fiscal-monetary": ["fiscal", "moneter", "monetary"],
};

// Friendly display name per slug
const SLUG_TO_LABEL: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  oil: "Oil",
  nikkei: "Nikkei Index",
  "hang-seng": "Hang Seng Index",
  crypto: "Crypto",
  eurusd: "EUR / USD",
  usdjpy: "USD / JPY",
  usdchf: "USD / CHF",
  audusd: "AUD / USD",
  gbpusd: "GBP / USD",
  "us-dollar": "US Dollar",
  "market-update": "Market Update",
  economy: "Global & Economy",
  "fiscal-moneter": "Fiscal & Monetary",
  "global-economics": "Global & Economy",
  "fiscal-monetary": "Fiscal & Monetary",
  "analisis-market": "Analisis Market",
};

// Economic news slugs - these link back to /economic-news
const ECONOMIC_SLUGS = new Set([
  "economy",
  "fiscal-moneter",
  "fiscal-monetary",
  "global-economics",
]);

// Strip HTML helper
const stripHtml = (html: string) => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .trim();
};

export function NewsCategoryList({
  categorySlug,
  locale,
  emptyLabel,
  messages,
}: NewsCategoryListProps) {
  const globalLoading = useLoading();

  // Bilingual labels — fallback to English if messages not provided
  const nc = messages?.equities?.newsCategories ?? {
    marketNewsTitle: "Market News",
    economicNewsTitle: "Economic News",
    viewAll: "View All",
    readMore: "Read More",
    allArticles: "All Articles",
    searchPlaceholder: "Search news...",
    noResults: "No results for",
    articles: "articles",
    results: "results",
    backToCategories: "Back to Categories",
    latestNews: "Latest News",
    popularNews: "Popular News",
    relatedNews: "Related News",
    loadingArticle: "Loading Article...",
    loadingArticles: "Loading Articles...",
    articleNotFound: "Article not found.",
    backTo: "← Back to",
    source: "Source",
    copied: "Copied!",
    searchBtn: "Search",
    closeSearch: "Close",
    searchNews: "Search News",
  };
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const perPage = 16;

  const isAll = categorySlug === "all";
  const label = isAll
    ? "All News"
    : (SLUG_TO_LABEL[categorySlug] ?? categorySlug);
  const targetIds = SLUG_TO_IDS[categorySlug] ?? [];
  const keywords = SLUG_KEYWORDS[categorySlug] ?? [];
  const isEconomic = ECONOMIC_SLUGS.has(categorySlug);

  useEffect(() => {
    const fetchArticles = async () => {
      const token = globalLoading.start("news-category-list");
      try {
        const res = await fetch(NEWS_API, {
          headers: { Authorization: `Bearer ${NEWS_TOKEN}` },
        });
        const json = await res.json();
        if (json?.data) {
          let filtered: any[] = [];
          if (isAll) {
            filtered = json.data;
          } else if (targetIds.length > 0) {
            // Direct ID match
            filtered = json.data.filter((item: any) =>
              targetIds.includes(item.category_id),
            );
          } else if (keywords.length > 0) {
            // Fuzzy keyword match against category slug/name
            filtered = json.data.filter((item: any) => {
              const catSlug = (item.kategori?.slug ?? "").toLowerCase();
              const catName = (item.kategori?.name ?? "").toLowerCase();
              return keywords.some(
                (kw) => catSlug.includes(kw) || catName.includes(kw),
              );
            });
          } else {
            // Fallback: match by exact slug
            filtered = json.data.filter(
              (item: any) => item.kategori?.slug === categorySlug,
            );
          }
          // Sort by most recent
          filtered.sort((a: any, b: any) => {
            return (
              (Date.parse(b.updated_at ?? b.created_at ?? "") || 0) -
              (Date.parse(a.updated_at ?? a.created_at ?? "") || 0)
            );
          });
          setArticles(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch articles", err);
      } finally {
        setLoading(false);
        globalLoading.stop(token);
      }
    };
    fetchArticles();
  }, [categorySlug]);

  const [copiedId, setCopiedId] = useState<number | string | null>(null);

  const getSiteOrigin = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL)
      return process.env.NEXT_PUBLIC_SITE_URL;
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  };

  const copyLink = (
    slug: string,
    id: number | string,
    itemCategorySlug: string,
    isItemEconomic: boolean,
  ) => {
    const path = `/${locale}/${isItemEconomic ? "economic-news" : "news"}/${itemCategorySlug}/${slug}`;
    const url = `${getSiteOrigin()}${path}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
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

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredBySearch = normalizedSearch
    ? articles.filter((item: any) => {
        const title = (item.titles?.default || item.title || "")
          .toString()
          .toLowerCase();
        const content = stripHtml(item.content ?? "")
          .toString()
          .toLowerCase();
        return (
          title.includes(normalizedSearch) || content.includes(normalizedSearch)
        );
      })
    : articles;

  const totalPages = Math.ceil(filteredBySearch.length / perPage) || 1;
  const paginated = filteredBySearch.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <i className="fa-solid fa-spinner fa-spin text-3xl mb-4"></i>
        <p className="text-sm font-semibold">Loading Articles...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    const message = emptyLabel ?? `No articles found for "${label}"`;
    return (
      <div>
        {/* Category Header */}
        <div className="flex items-center justify-between">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
              <Link
                href={`/${locale}/equities`}
                className="hover:text-blue-600 transition"
              >
                {isEconomic
                  ? nc.economicNewsTitle
                  : isAll
                    ? nc.allArticles
                    : nc.marketNewsTitle}
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-semibold">{label}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{label}</h1>
            <p className="text-slate-500 mt-2 text-sm">
              {filteredBySearch.length} {nc.articles}
            </p>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-end gap-3">
              {!isSearchOpen && (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-800 transition"
                  aria-label="Open search"
                >
                  <i className="fa-solid fa-magnifying-glass text-xs"></i>
                  {nc.searchBtn}
                </button>
              )}
              {isSearchOpen && (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm w-full max-w-md">
                  <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm"></i>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    placeholder={nc.searchPlaceholder}
                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    aria-label="Search news"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setIsSearchOpen(false);
                      setPage(1);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                    aria-label="Close search"
                  >
                    {nc.closeSearch}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-800 transition"
                  aria-label={isSearchOpen ? "Close search" : "Open search"}
                >
                  <i className="fa-solid fa-magnifying-glass text-xs"></i>
                  {nc.searchBtn}
                </button>
              </div>
              {isSearchOpen && (
                <div
                  className="fixed inset-0 z-50 bg-black/40 flex items-end"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Search news"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <div
                    className="w-full rounded-t-2xl bg-white p-4 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">
                        {nc.searchNews}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setIsSearchOpen(false);
                          setPage(1);
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                        aria-label="Close search"
                      >
                        {nc.closeSearch}
                      </button>
                    </div>
                    <div className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                      <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm"></i>
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPage(1);
                        }}
                        placeholder={nc.searchPlaceholder}
                        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                        aria-label="Search news"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-md">
          <div className="flex flex-col items-center gap-7 py-20 px-10">
            <div className="flex flex-col items-center">
              <Image
                src="/assets/nodata.png"
                alt="Logo Newsmaker23"
                width={360}
                height={360} // sesuai rasio 1:1
              />

              <p className="text-sm md:text-base text-slate-500 font-semibold text-center max-w-lg">
                {locale === "id"
                  ? "Belum ada data yang tersedia untuk ditampilkan saat ini. Silakan kembali beberapa saat lagi."
                  : "No data available at the moment. Please check back later."}
              </p>
            </div>

            <Link
              href={`/${locale}/equities`}
              className="text-sm md:text-base bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 font-semibold text-white transition"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-arrow-left text-xs"></i>
                <span className="leading-none">{nc.backToCategories}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link
              href={`/${locale}/equities`}
              className="hover:text-blue-600 transition"
            >
              {isEconomic
                ? nc.economicNewsTitle
                : isAll
                  ? nc.allArticles
                  : nc.marketNewsTitle}
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">{label}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{label}</h1>
          <p className="text-slate-500 mt-2 text-sm">
            {filteredBySearch.length} {nc.articles}
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          {/* Desktop */}
          <div className="hidden md:flex items-center justify-end gap-3">
            {!isSearchOpen && (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-800 transition"
                aria-label="Open search"
              >
                <i className="fa-solid fa-magnifying-glass text-xs"></i>
                {nc.searchBtn}
              </button>
            )}
            {isSearchOpen && (
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm w-full max-w-md">
                <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm"></i>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder={nc.searchPlaceholder}
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  aria-label="Search news"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setIsSearchOpen(false);
                    setPage(1);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  aria-label="Close search"
                >
                  {nc.closeSearch}
                </button>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsSearchOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-800 transition"
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
                <i className="fa-solid fa-magnifying-glass text-xs"></i>
                {nc.searchBtn}
              </button>
            </div>
            {isSearchOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/40 flex items-end"
                role="dialog"
                aria-modal="true"
                aria-label="Search news"
                onClick={() => setIsSearchOpen(false)}
              >
                <div
                  className="w-full rounded-t-2xl bg-white p-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700">
                      {nc.searchNews}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setIsSearchOpen(false);
                        setPage(1);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      aria-label="Close search"
                    >
                      {nc.closeSearch}
                    </button>
                  </div>
                  <div className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm"></i>
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                      }}
                      placeholder={nc.searchPlaceholder}
                      className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                      aria-label="Search news"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredBySearch.length === 0 && (
        <div className="text-center py-16">
          <i className="fa-solid fa-magnifying-glass text-3xl text-slate-200 mb-3"></i>
          <p className="text-slate-500 font-semibold">
            {nc.noResults} "{searchTerm.trim()}"
          </p>
        </div>
      )}

      {/* Article Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginated.map((item, idx) => {
          const thumb = item.images?.[0]
            ? `${IMAGE_BASE}${item.images[0]}`
            : null;
          const title = item.titles?.default || item.title;
          const summary = stripHtml(item.content ?? "").substring(0, 140);
          const date = new Date(
            item.updated_at || item.created_at,
          ).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          const catName =
            item.kategori?.name?.toUpperCase() ?? label.toUpperCase();

          const itemCategorySlug = item.kategori?.slug ?? categorySlug;
          const isItemEconomic = ECONOMIC_SLUGS.has(itemCategorySlug);
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
                      (e.target as HTMLImageElement).src =
                        "https://archive.org/download/placeholder-image/placeholder-image.jpg";
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-linear-to-br from-blue-100 to-slate-200 flex items-center justify-center">
                    <i className="fa-solid fa-newspaper text-slate-300 text-3xl"></i>
                  </div>
                )}
                {/* Category badge */}
                <div className="absolute top-2 left-3">
                  <div className=" bg-blue-700/50 group-hover:bg-blue-700 rounded-full px-2 py-0.5 transition duration-300">
                    <p className=" text-[10px] font-bold uppercase tracking-wider text-white">
                      {catName}
                    </p>
                  </div>
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
                    href={`/${locale}/${isItemEconomic ? "economic-news" : "news"}/${itemCategorySlug}/${item.slug ?? ""}`}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
                  >
                    {nc.readMore.toUpperCase()}
                  </Link>
                  {/* Social share row */}
                  {(() => {
                    const articlePath = `/${locale}/${isItemEconomic ? "economic-news" : "news"}/${itemCategorySlug}/${item.slug ?? ""}`;
                    const articleUrl = `${getSiteOrigin()}${articlePath}`;
                    const encodedUrl = encodeURIComponent(articleUrl);
                    const encodedTitle = encodeURIComponent(title);
                    const waUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
                    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                    const xUrl = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                    const isCopied = copiedId === (item.id ?? idx);

                    return (
                      <div className="flex items-center gap-2.5 mt-3">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Share to WhatsApp"
                          className="text-slate-400 hover:text-green-500 transition text-sm"
                        >
                          <i className="fa-brands fa-whatsapp"></i>
                        </a>
                        <a
                          href={fbUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Share to Facebook"
                          className="text-slate-400 hover:text-blue-600 transition text-sm"
                        >
                          <i className="fa-brands fa-facebook"></i>
                        </a>
                        <a
                          href={xUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Share to X"
                          className="text-slate-400 hover:text-slate-800 transition text-sm"
                        >
                          <i className="fa-brands fa-x-twitter"></i>
                        </a>
                        <button
                          onClick={() =>
                            copyLink(
                              item.slug ?? "",
                              item.id ?? idx,
                              itemCategorySlug,
                              isItemEconomic,
                            )
                          }
                          title="Copy link"
                          className={`text-sm transition ${isCopied ? "text-blue-600" : "text-slate-400 hover:text-blue-500"}`}
                        >
                          <i
                            className={`fa-solid ${isCopied ? "fa-check" : "fa-link"}`}
                          ></i>
                        </button>
                        {isCopied && (
                          <span className="text-[10px] text-blue-600 font-semibold animate-in fade-in">
                            Copied!
                          </span>
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
      {filteredBySearch.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          scrollTop
          className="mt-10"
        />
      )}
    </div>
  );
}
