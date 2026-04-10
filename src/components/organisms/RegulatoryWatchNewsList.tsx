"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pagination } from "../molecules/Pagination";
import type { Messages } from "@/locales";
import {
  resolveRegulatoryWatchContent,
  resolveRegulatoryWatchImage,
  resolveRegulatoryWatchTitle,
  stripHtml,
  type RegulatoryWatchItem,
} from "@/lib/regulatory-watch";

type RegulatoryWatchNewsListProps = {
  locale: "id" | "en";
  messages?: Messages;
  items: RegulatoryWatchItem[];
  label: string;
  parentHref: string;
  parentLabel: string;
  emptyLabel: string;
  detailBasePath: string;
};

type DisplayItem = {
  key: string;
  id: number | string;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tag: string;
  image: string | null;
  href: string;
};

export function RegulatoryWatchNewsList({
  locale,
  messages,
  items,
  label,
  parentHref,
  parentLabel,
  emptyLabel,
  detailBasePath,
}: RegulatoryWatchNewsListProps) {
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
    backTo: "Back to",
    source: "Source",
    copied: "Copied!",
    searchBtn: "Search",
    closeSearch: "Close",
    searchNews: "Search News",
  };

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const perPage = 16;

  const normalizedDetailBasePath = detailBasePath
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  const mappedItems = useMemo<DisplayItem[]>(() => {
    return items
      .map((item, idx) => {
        const slug = item.slug?.trim();
        if (!slug) return null;

        const title = resolveRegulatoryWatchTitle(item, locale);
        const summary = stripHtml(
          resolveRegulatoryWatchContent(item, locale),
        ).substring(0, 140);
        const rawDate = item.updated_at ?? item.created_at ?? "";
        const parsedDate = new Date(rawDate);
        const date = Number.isNaN(parsedDate.getTime())
          ? rawDate || (locale === "en" ? "N/A" : "-")
          : parsedDate.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

        const image = resolveRegulatoryWatchImage(item);
        const tag = (
          item.category_label ??
          item.category ??
          label
        ).toUpperCase();
        const href = `/${locale}/${normalizedDetailBasePath}/${encodeURIComponent(slug)}`;
        const id = item.id ?? idx;

        return {
          key: `${slug}-${id}`,
          id,
          slug,
          title,
          summary,
          date,
          tag,
          image,
          href,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [items, label, locale, normalizedDetailBasePath]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredBySearch = normalizedSearch
    ? mappedItems.filter((item) => {
        return (
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.summary.toLowerCase().includes(normalizedSearch)
        );
      })
    : mappedItems;

  const totalPages = Math.ceil(filteredBySearch.length / perPage) || 1;
  const paginated = filteredBySearch.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const getSiteOrigin = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL)
      return process.env.NEXT_PUBLIC_SITE_URL;
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  };

  const copyLink = (href: string, id: number | string) => {
    const url = `${getSiteOrigin()}${href}`;
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

  if (mappedItems.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
              <Link
                href={parentHref}
                className="transition hover:text-blue-600"
              >
                {parentLabel}
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-700">{label}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{label}</h1>
            <p className="mt-2 text-sm text-slate-500">0 {nc.articles}</p>
          </div>
        </div>

        <div className="rounded-md bg-blue-50">
          <div className="flex flex-col items-center gap-7 px-10 py-20">
            <div className="flex flex-col items-center">
              <Image
                src="/assets/nodata.png"
                alt="No data"
                width={360}
                height={360}
              />
              <p className="max-w-lg text-center text-sm font-semibold text-slate-500 md:text-base">
                {emptyLabel}
              </p>
            </div>

            <Link
              href={parentHref}
              className="rounded bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 md:text-base"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-arrow-left text-xs" />
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
      <div className="flex items-center justify-between">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
            <Link href={parentHref} className="transition hover:text-blue-600">
              {parentLabel}
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">{label}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{label}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {filteredBySearch.length} {nc.articles}
          </p>
        </div>

        <div className="mb-6">
          <div className="hidden items-center justify-end gap-3 md:flex">
            {!isSearchOpen && (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-blue-800"
                aria-label="Open search"
              >
                <i className="fa-solid fa-magnifying-glass text-xs" />
                {nc.searchBtn}
              </button>
            )}
            {isSearchOpen && (
              <div className="flex w-full max-w-md items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <i className="fa-solid fa-magnifying-glass text-sm text-slate-400" />
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

          <div className="md:hidden">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsSearchOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-blue-800"
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
                <i className="fa-solid fa-magnifying-glass text-xs" />
                {nc.searchBtn}
              </button>
            </div>
            {isSearchOpen && (
              <div
                className="fixed inset-0 z-50 flex items-end bg-black/40"
                role="dialog"
                aria-modal="true"
                aria-label="Search news"
                onClick={() => setIsSearchOpen(false)}
              >
                <div
                  className="w-full rounded-t-2xl bg-white p-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-3 flex items-center justify-between">
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
                    <i className="fa-solid fa-magnifying-glass text-sm text-slate-400" />
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
        <div className="py-16 text-center">
          <i className="fa-solid fa-magnifying-glass mb-3 text-3xl text-slate-200" />
          <p className="font-semibold text-slate-500">
            {nc.noResults}{" "}
            <span className="font-semibold">{searchTerm.trim()}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {paginated.map((item) => {
          const encodedUrl = encodeURIComponent(
            `${getSiteOrigin()}${item.href}`,
          );
          const encodedTitle = encodeURIComponent(item.title);
          const waUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          const xUrl = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.key}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="relative h-48 shrink-0 overflow-hidden bg-slate-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://archive.org/download/placeholder-image/placeholder-image.jpg";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-100 to-slate-200">
                    <i className="fa-solid fa-newspaper text-3xl text-slate-300" />
                  </div>
                )}
                <div className="absolute left-3 top-2">
                  <div className="rounded-full bg-blue-700/50 px-2 py-0.5 transition duration-300 group-hover:bg-blue-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                      {item.tag}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-3 line-clamp-3 text-sm font-bold leading-snug text-slate-800 transition group-hover:text-blue-700">
                  {item.title}
                </h3>
                <p className="mb-4 line-clamp-3 flex-1 text-xs leading-relaxed text-slate-500">
                  {item.summary}...
                </p>

                <div className="mt-auto">
                  <p className="mb-3 text-[10px] text-slate-400">{item.date}</p>
                  <Link
                    href={item.href}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-800"
                  >
                    {nc.readMore.toUpperCase()}
                  </Link>

                  <div className="mt-3 flex items-center gap-2.5">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share to WhatsApp"
                      className="text-sm text-slate-400 transition hover:text-green-500"
                    >
                      <i className="fa-brands fa-whatsapp" />
                    </a>
                    <a
                      href={fbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share to Facebook"
                      className="text-sm text-slate-400 transition hover:text-blue-600"
                    >
                      <i className="fa-brands fa-facebook" />
                    </a>
                    <a
                      href={xUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share to X"
                      className="text-sm text-slate-400 transition hover:text-slate-800"
                    >
                      <i className="fa-brands fa-x-twitter" />
                    </a>
                    <button
                      onClick={() => copyLink(item.href, item.id)}
                      title="Copy link"
                      className={`text-sm transition ${isCopied ? "text-blue-600" : "text-slate-400 hover:text-blue-500"}`}
                    >
                      <i
                        className={`fa-solid ${isCopied ? "fa-check" : "fa-link"}`}
                      />
                    </button>
                    {isCopied && (
                      <span className="animate-in fade-in text-[10px] font-semibold text-blue-600">
                        {nc.copied}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
