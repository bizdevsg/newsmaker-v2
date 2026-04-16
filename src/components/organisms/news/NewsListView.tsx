"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { NewsList } from "@/components/organisms/news/NewsList";
import type { NewsCardItem } from "@/lib/news-cards";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type TabItem = {
  label: string;
  href: string;
  active?: boolean;
};

type NewsListViewProps = {
  title: string;
  breadcrumb: BreadcrumbItem[];
  tabs?: TabItem[] | null;
  items: NewsCardItem[];
  locale: "en" | "id";
  backHref?: string | null;
  backLabel?: string | null;
  emptyMessage?: string | null;
};

const cleanText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export function NewsListView({
  title,
  breadcrumb,
  tabs,
  items,
  locale,
  backHref,
  backLabel,
  emptyMessage,
}: NewsListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 16;

  const normalizedSearch = cleanText(searchTerm);

  const filtered = useMemo(() => {
    if (!normalizedSearch) return items;
    const terms = normalizedSearch.split(" ").filter(Boolean);
    return items.filter((item) => {
      const haystack = cleanText(
        `${item.title} ${item.summary} ${item.tag} ${item.date}`,
      );
      return terms.every((term) => haystack.includes(term));
    });
  }, [items, normalizedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, page, totalPages]);

  const countLabel = normalizedSearch
    ? locale === "en"
      ? `${filtered.length} results`
      : `${filtered.length} hasil`
    : locale === "en"
      ? `${items.length} articles`
      : `${items.length} artikel`;

  const resolvedEmptyMessage =
    emptyMessage ??
    (locale === "en"
      ? `No articles for ${title}.`
      : `Belum ada berita untuk ${title}.`);

  const closeSearch = () => {
    setSearchTerm("");
    setIsSearchOpen(false);
    setPage(1);
  };

  const setSearchValue = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  useEffect(() => {
    if (!isSearchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSearchOpen]);

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col gap-5">
        <div className="flex gap-4 items-center justify-between">
          <div className="min-w-0">
            <nav className="text-sm text-slate-500">
              {breadcrumb.map((item, index) => {
                const content = item.href ? (
                  <Link href={item.href} className="hover:text-blue-700">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-900 font-medium">
                    {item.label}
                  </span>
                );

                return (
                  <span key={`${item.label}-${index}`}>
                    {index > 0 ? (
                      <span className="mx-2 text-slate-300">/</span>
                    ) : null}
                    {content}
                  </span>
                );
              })}
            </nav>

            <h1 className="mt-3 text-xl md:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              {countLabel}
            </p>
          </div>

          <div className="sm:w-auto">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-end gap-3">
              {!isSearchOpen ? (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="inline-flex w-fit h-fit items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-800 transition"
                  aria-label={
                    locale === "en" ? "Open search" : "Buka pencarian"
                  }
                >
                  <i
                    className="fa-solid fa-magnifying-glass text-xs"
                    aria-hidden="true"
                  />
                  {locale === "en" ? "Search" : "Cari"}
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm w-full max-w-md">
                  <i
                    className="fa-solid fa-magnifying-glass text-slate-400 text-sm"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={
                      locale === "en" ? "Search news..." : "Cari berita..."
                    }
                    className="w-full bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    aria-label={locale === "en" ? "Search news" : "Cari berita"}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                    aria-label={
                      locale === "en" ? "Close search" : "Tutup pencarian"
                    }
                  >
                    {locale === "en" ? "Close" : "Tutup"}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsSearchOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-700 px-5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-blue-800"
                aria-label={locale === "en" ? "Search" : "Cari"}
              >
                <i
                  className="fa-solid fa-magnifying-glass text-xs"
                  aria-hidden="true"
                />
                {locale === "en" ? "Search" : "Cari"}
              </button>
            </div>

            {isSearchOpen ? (
              <div
                className="fixed inset-0 z-50 bg-black/40 flex items-end md:hidden"
                role="dialog"
                aria-modal="true"
                aria-label={locale === "en" ? "Search news" : "Cari berita"}
                onClick={() => setIsSearchOpen(false)}
              >
                <div
                  className="w-full rounded-t-2xl bg-white p-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700">
                      {locale === "en" ? "Search News" : "Cari Berita"}
                    </span>
                    <button
                      type="button"
                      onClick={closeSearch}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      aria-label={
                        locale === "en" ? "Close search" : "Tutup pencarian"
                      }
                    >
                      {locale === "en" ? "Close" : "Tutup"}
                    </button>
                  </div>
                  <div className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <i
                      className="fa-solid fa-magnifying-glass text-slate-400 text-sm"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={
                        locale === "en" ? "Search news..." : "Cari berita..."
                      }
                      className="w-full bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                      aria-label={
                        locale === "en" ? "Search news" : "Cari berita"
                      }
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {tabs?.length ? (
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  tab.active
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="mt-2 overflow-hidden rounded-xl bg-[#EEF4FB] p-6 sm:p-10">
            <div className="flex flex-col items-center gap-7 py-10 text-center">
              <div className="flex flex-col items-center">
                <img
                  src="/assets/nodata.png"
                  alt=""
                  className="h-56 w-auto max-w-full sm:h-72"
                  loading="lazy"
                />
                <p className="mt-6 text-sm font-semibold text-slate-600 max-w-lg">
                  {resolvedEmptyMessage}
                </p>
              </div>

              {backHref ? (
                <Link
                  href={backHref}
                  className="text-sm bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 font-semibold text-white transition"
                >
                  <span className="inline-flex items-center gap-2">
                    <i
                      className="fa-solid fa-arrow-left text-xs"
                      aria-hidden="true"
                    />
                    {backLabel ??
                      (locale === "en"
                        ? "Back to categories"
                        : "Kembali ke Kategori")}
                  </span>
                </Link>
              ) : null}
            </div>
          </div>
        ) : filtered.length === 0 && normalizedSearch ? (
          <div className="text-center py-16">
            <i
              className="fa-solid fa-magnifying-glass text-3xl text-slate-200 mb-3"
              aria-hidden="true"
            />
            <p className="text-slate-500 font-semibold">
              {locale === "en" ? "No results for" : "Tidak ada hasil untuk"}{" "}
              <span className="font-semibold">{searchTerm.trim()}</span>
            </p>
          </div>
        ) : filtered.length ? (
          <NewsList
            items={paginated}
            readMoreLabel={locale === "en" ? "Read More" : "Baca Selengkapnya"}
          />
        ) : (
          <div className="mt-2 overflow-hidden rounded-xl bg-[#EEF4FB] p-6 sm:p-10">
            <div className="grid place-items-center text-center">
              <img
                src="/assets/nodata.png"
                alt=""
                className="h-56 w-auto max-w-full sm:h-72"
                loading="lazy"
              />
              <p className="mt-6 text-sm font-semibold text-slate-600">
                {resolvedEmptyMessage}
              </p>
              {backHref ? (
                <div className="mt-6">
                  <Button href={backHref} variant="primary" size="md">
                    <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                    {backLabel ??
                      (locale === "en"
                        ? "Back to categories"
                        : "Kembali ke Kategori")}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {filtered.length > 0 && totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.blur();
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-700 cursor-pointer disabled:cursor-not-allowed"
            >
              <i
                className="fa-solid fa-arrow-left text-[11px]"
                aria-hidden="true"
              />
              {locale === "en" ? "Prev" : "Prev"}
            </button>
            <div className="hidden sm:block text-sm font-semibold text-slate-600">
              {locale === "en" ? "Page" : "Halaman"}{" "}
              <span className="font-extrabold text-slate-900">{page}</span>{" "}
              {locale === "en" ? "of" : "dari"}{" "}
              <span className="font-extrabold text-slate-900">
                {totalPages}
              </span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.blur();
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-700 cursor-pointer disabled:cursor-not-allowed"
            >
              {locale === "en" ? "Next" : "Next"}
              <i
                className="fa-solid fa-arrow-right text-[11px]"
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
