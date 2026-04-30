"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pagination } from "../molecules/Pagination";
import { useLoading } from "../providers/LoadingProvider";
import Image from "next/image";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";
import { normalizePortalNewsCategory } from "@/lib/portalnews";
import { resolvePortalNewsImageSrc } from "@/lib/portalnews-image-proxy";
import {
  resolveIndonesiaMarketNewsCategoryLabelFromItem,
  resolveIndonesiaMarketNewsCategorySlugFromItem,
} from "@/lib/indonesia-market-news-category";

import type { Messages } from "@/locales";

type NewsCategoryListProps = {
  categorySlug: string;
  locale: string;
  emptyLabel?: string;
  labelOverride?: string;
  detailBasePath?: string;
  includeCategoryValues?: string[];
  excludeCategoryValues?: string[];
  requiredMainCategorySlug?: string;
  messages?: Messages;
  parentHref?: string;
  parentLabel?: string;
};

type NewsListItem = {
  id?: number | string;
  title?: string;
  titles?: {
    default?: string;
  };
  slug?: string;
  content?: string;
  category?: string;
  category_label?: string;
  subcategory?: string;
  subcategory_label?: string;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
  images?: string[];
  kategori?: {
    id?: number;
    name?: string;
    slug?: string;
  };
  main_category?: {
    id?: number;
    name?: string;
    slug?: string;
  };
  sub_category?: {
    id?: number;
    name?: string;
    slug?: string;
  };
};

type NewsCategoryItem = {
  id?: number;
  name?: string;
  slug?: string;
};

type NewsListPayload = {
  status?: string;
  imageBase?: string;
  data?: NewsListItem[];
};

type NewsCategoriesPayload = {
  status?: string;
  data?: NewsCategoryItem[];
};

const EMPTY_CATEGORY_VALUES: string[] = [];

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
  "pasar-indonesia": [], // Special: uses dedicated API endpoint
  "makro-ekonomi": [],
  "pasar-saham": [],
  "obligasi-sbn": [],
  "rupiah-dan-valas": [],
  komoditas: [],
  "korporasi-emiten": [],
  "investasi-strategi": [],
};

// Keywords used to fuzzy-match articles when no direct ID mapping exists
const SLUG_KEYWORDS: Record<string, string[]> = {
  crypto: ["crypto", "kripto", "bitcoin", "btc", "ethereum", "eth"],
  economy: ["global", "economy", "global-economics", "ekonomi"],
  "fiscal-moneter": ["fiscal", "moneter", "monetary", "fiskal"],
  "fiscal-monetary": ["fiscal", "moneter", "monetary"],
  "pasar-indonesia": ["pasar", "indonesia", "market", "saham", "ihsg"],
  "makro-ekonomi": [
    "makro ekonomi",
    "macro economy",
    "global economy",
    "global economics",
    "ekonomi global",
    "fiscal",
    "fiskal",
    "moneter",
    "monetary",
  ],
  "pasar-saham": [
    "pasar saham",
    "saham",
    "ihsg",
    "idx",
    "equity",
    "equities",
    "stock",
    "indonesia market",
    "berita nasional",
    "nasional",
    "indeks",
    "index",
    "indices",
  ],
  "obligasi-sbn": [
    "obligasi",
    "obligasi sbn",
    "sbn",
    "bond",
    "bonds",
    "yield",
    "imbal hasil",
  ],
  "rupiah-dan-valas": [
    "rupiah",
    "valas",
    "rupiah dan valas",
    "forex",
    "currency",
    "currencies",
    "fx",
    "us dollar",
    "dollar as",
    "dolar as",
    "usd index",
    "eur usd",
    "eurusd",
    "usd jpy",
    "usdjpy",
    "usd chf",
    "usdchf",
    "aud usd",
    "audusd",
    "gbp usd",
    "gbpusd",
  ],
  komoditas: [
    "komoditas",
    "commodity",
    "commodities",
    "gold",
    "emas",
    "silver",
    "oil",
    "crude",
    "coal",
    "cpo",
    "nickel",
    "nikel",
  ],
  "korporasi-emiten": [
    "korporasi",
    "emiten",
    "korporasi emiten",
    "corporate",
    "issuer",
    "issuers",
    "dividen",
    "ipo",
    "laba",
    "earnings",
  ],
  "investasi-strategi": [
    "investasi",
    "strategi",
    "investasi strategi",
    "investment",
    "strategy",
    "analisis market",
    "market analysis",
    "market outlook",
    "outlook",
  ],
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
  "indonesia-market": "Indonesia Market",
  "analysis-market-indonesia": "Analysis Market Indonesia",
  economy: "Global & Economy",
  "fiscal-moneter": "Fiscal & Monetary",
  "global-economics": "Global & Economy",
  "fiscal-monetary": "Fiscal & Monetary",
  "analisis-market": "Analisis Market",
  "pasar-indonesia": "Pasar Indonesia",
  "makro-ekonomi": "Makro Ekonomi",
  "pasar-saham": "Pasar Saham",
  "obligasi-sbn": "Obligasi & SBN",
  "rupiah-dan-valas": "Rupiah & Valas",
  komoditas: "Komoditas",
  "korporasi-emiten": "Korporasi & Emiten",
  "investasi-strategi": "Investasi & Strategi",
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

const getCategoryKeys = (item: NewsListItem) =>
  [
    item.category,
    item.category_label,
    item.subcategory,
    item.subcategory_label,
    item.kategori?.slug,
    item.kategori?.name,
    item.sub_category?.slug,
    item.sub_category?.name,
    item.main_category?.slug,
    item.main_category?.name,
  ]
    .map((value) => normalizePortalNewsCategory(value))
    .filter(Boolean);

const getCategoryIds = (item: NewsListItem) =>
  [
    item.category_id,
    item.kategori?.id,
    item.sub_category?.id,
    item.main_category?.id,
  ].filter((value): value is number => typeof value === "number");

const formatBadgeLabel = (value: string) =>
  value.trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ").toUpperCase();

export function NewsCategoryList({
  categorySlug,
  locale,
  emptyLabel,
  labelOverride,
  detailBasePath,
  includeCategoryValues,
  excludeCategoryValues,
  requiredMainCategorySlug,
  messages,
  parentHref,
  parentLabel,
}: NewsCategoryListProps) {
  const { start, stop } = useLoading();

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
  const [articles, setArticles] = useState<NewsListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [imageBase, setImageBase] = useState("");
  const perPage = 16;
  const resolvedLocale = locale === "en" ? "en" : "id";
  const resolvedIncludeCategoryValues =
    includeCategoryValues ?? EMPTY_CATEGORY_VALUES;
  const resolvedExcludeCategoryValues =
    excludeCategoryValues ?? EMPTY_CATEGORY_VALUES;

  const isAll = categorySlug === "all";
  const isEconomic = ECONOMIC_SLUGS.has(categorySlug);
  const label =
    labelOverride ??
    (isAll ? nc.allArticles : (SLUG_TO_LABEL[categorySlug] ?? categorySlug));
  const resolvedParentHref = parentHref ?? `/${locale}/news`;
  const resolvedParentLabel =
    parentLabel ??
    (isEconomic
      ? nc.economicNewsTitle
      : isAll
        ? nc.allArticles
        : nc.marketNewsTitle);
  const targetIds = useMemo(
    () => SLUG_TO_IDS[categorySlug] ?? [],
    [categorySlug],
  );
  const keywords = useMemo(
    () => SLUG_KEYWORDS[categorySlug] ?? [],
    [categorySlug],
  );
  const includedCategorySignature = resolvedIncludeCategoryValues.join("|");
  const includedCategoryKeys = useMemo(
    () =>
      (includedCategorySignature
        ? includedCategorySignature.split("|")
        : EMPTY_CATEGORY_VALUES
      )
        .map((value) => normalizePortalNewsCategory(value))
        .filter(Boolean),
    [includedCategorySignature],
  );
  const excludedCategorySignature = resolvedExcludeCategoryValues.join("|");
  const excludedCategoryKeys = useMemo(
    () =>
      (excludedCategorySignature
        ? excludedCategorySignature.split("|")
        : EMPTY_CATEGORY_VALUES
      )
        .map((value) => normalizePortalNewsCategory(value))
        .filter(Boolean),
    [excludedCategorySignature],
  );
  const normalizedRequiredMainCategorySlug = normalizePortalNewsCategory(
    requiredMainCategorySlug,
  );
  const normalizedDetailBasePath = detailBasePath
    ?.replace(/^\/+/, "")
    .replace(/\/+$/, "");

  useEffect(() => {
    let isActive = true;

    const fetchArticles = async () => {
      const token = start("news-category-list");
      try {
        const shouldUsePasarIndonesiaFeed = [
          "pasar-indonesia",
          "makro-ekonomi",
          "pasar-saham",
          "obligasi-sbn",
          "rupiah-dan-valas",
          "komoditas",
          "korporasi-emiten",
          "investasi-strategi",
        ].includes(categorySlug);

        // Special handling for analysis-market category (dedicated API endpoint)
        if (categorySlug === "analisis-market") {
          const articlesRes = await fetch(
            "/api/portalnews/pasar-indonesia/analisis",
            {
              cache: "no-store",
            },
          );

          const json = (await articlesRes
            .json()
            .catch(() => null)) as NewsListPayload | null;

          if (isActive && json?.data) {
            setArticles(json.data);
            setImageBase(
              typeof json.imageBase === "string" ? json.imageBase : "",
            );
          }
          return;
        }

        if (shouldUsePasarIndonesiaFeed) {
          const articlesRes = await fetch("/api/portalnews/pasar-indonesia", {
            cache: "no-store",
          });

            const json = (await articlesRes
              .json()
              .catch(() => null)) as NewsListPayload | null;

            if (isActive && json?.data) {
              let filtered = json.data;

              if (categorySlug !== "pasar-indonesia") {
                filtered = json.data.filter((item) => {
                  const keys = getCategoryKeys(item);
                  return keywords.length
                    ? keywords.some((kw) => keys.some((key) => key.includes(kw)))
                    : keys.includes(categorySlug);
                });
              }

              if (includedCategoryKeys.length > 0) {
                filtered = filtered.filter((item) => {
                  const itemCategoryKeys = getCategoryKeys(item);
                  return includedCategoryKeys.some((key) =>
                    itemCategoryKeys.some(
                      (itemKey) => itemKey === key || itemKey.includes(key),
                    ),
                  );
                });
              }

              if (excludedCategoryKeys.length > 0) {
                filtered = filtered.filter((item) => {
                  const itemCategoryKeys = getCategoryKeys(item);
                  return !excludedCategoryKeys.some((key) =>
                    itemCategoryKeys.some(
                      (itemKey) => itemKey === key || itemKey.includes(key),
                    ),
                  );
                });
              }

              setArticles(filtered);
              setImageBase(
                typeof json.imageBase === "string" ? json.imageBase : "",
              );
            }
          return;
        }

        const [articlesRes, categoriesRes] = await Promise.all([
          fetch("/api/portalnews", {
            cache: "no-store",
          }),
          fetch("/api/portalnews/categories", {
            cache: "no-store",
          }),
        ]);

        const json = (await articlesRes
          .json()
          .catch(() => null)) as NewsListPayload | null;
        const categoriesJson = (await categoriesRes
          .json()
          .catch(() => null)) as NewsCategoriesPayload | null;

        if (json?.data) {
          const categories = Array.isArray(categoriesJson?.data)
            ? categoriesJson.data
            : [];
          const dynamicTargetId = categories.find(
            (item) => item.slug === categorySlug,
          )?.id;
          const effectiveTargetIds =
            typeof dynamicTargetId === "number" ? [dynamicTargetId] : targetIds;

          let filtered: NewsListItem[] = [];
          if (isAll) {
            filtered = json.data;
          } else if (effectiveTargetIds.length > 0) {
            // Direct ID match
            filtered = json.data.filter((item) => {
              const ids = getCategoryIds(item);
              const keys = getCategoryKeys(item);
              return (
                ids.some((id) => effectiveTargetIds.includes(id)) ||
                keys.includes(categorySlug)
              );
            });
          } else if (keywords.length > 0) {
            // Fuzzy keyword match against category slug/name
            filtered = json.data.filter((item) => {
              const keys = getCategoryKeys(item);
              return keywords.some((kw) =>
                keys.some((key) => key.includes(kw)),
              );
            });
          } else {
            // Fallback: match by exact slug
            filtered = json.data.filter((item) =>
              getCategoryKeys(item).includes(categorySlug),
            );
          }

          if (includedCategoryKeys.length > 0) {
            filtered = filtered.filter((item) => {
              const itemCategoryKeys = getCategoryKeys(item);
              return includedCategoryKeys.some((key) =>
                itemCategoryKeys.some(
                  (itemKey) => itemKey === key || itemKey.includes(key),
                ),
              );
            });
          }

          if (excludedCategoryKeys.length > 0) {
            filtered = filtered.filter((item) => {
              const itemCategoryKeys = getCategoryKeys(item);
              return !excludedCategoryKeys.some((key) =>
                itemCategoryKeys.some(
                  (itemKey) => itemKey === key || itemKey.includes(key),
                ),
              );
            });
          }

          if (normalizedRequiredMainCategorySlug) {
            filtered = filtered.filter(
              (item) =>
                normalizePortalNewsCategory(item.main_category?.slug) ===
                normalizedRequiredMainCategorySlug,
            );
          }

          // Sort by most recent
          filtered.sort((a, b) => {
            return (
              (Date.parse(b.updated_at ?? b.created_at ?? "") || 0) -
              (Date.parse(a.updated_at ?? a.created_at ?? "") || 0)
            );
          });
          if (!isActive) return;
          setArticles(filtered);
          setImageBase(
            typeof json.imageBase === "string" ? json.imageBase : "",
          );
        }
      } catch (err) {
        console.error("Failed to fetch articles", err);
      } finally {
        if (isActive) {
          setLoading(false);
        }
        stop(token);
      }
    };
    fetchArticles();

    return () => {
      isActive = false;
    };
  }, [
    categorySlug,
    includedCategoryKeys,
    excludedCategoryKeys,
    isAll,
    keywords,
    normalizedRequiredMainCategorySlug,
    start,
    stop,
    targetIds,
  ]);

  const [copiedId, setCopiedId] = useState<number | string | null>(null);

  const getSiteOrigin = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL)
      return process.env.NEXT_PUBLIC_SITE_URL;
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  };

  const buildDetailHref = (
    slug: string | undefined,
    itemCategorySlug: string,
    isItemEconomic: boolean,
  ) => {
    const normalizedSlug = slug?.trim();

    if (normalizedDetailBasePath) {
      return normalizedSlug
        ? `/${locale}/${normalizedDetailBasePath}/${normalizedSlug}`
        : `/${locale}/${normalizedDetailBasePath}`;
    }

    return `/${locale}/${isItemEconomic ? "economic-news" : "news"}/${itemCategorySlug}/${normalizedSlug ?? ""}`;
  };

  const copyLink = (
    slug: string | undefined,
    id: number | string,
    itemCategorySlug: string,
    isItemEconomic: boolean,
  ) => {
    const path = buildDetailHref(slug, itemCategorySlug, isItemEconomic);
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
    ? articles.filter((item) => {
        const title = resolvePortalNewsTitle(item, locale).toLowerCase();
        const content = stripHtml(
          resolvePortalNewsContent(item, locale),
        ).toLowerCase();
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

  const resolveImage = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return resolvePortalNewsImageSrc(path);

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const full = imageBase ? `${imageBase}${normalizedPath}` : normalizedPath;
    return resolvePortalNewsImageSrc(full);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <i className="fa-solid fa-spinner fa-spin text-3xl mb-4"></i>
        <p className="text-sm font-semibold">Loading Articles...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="px-6 py-6">
        {/* Category Header */}
        <div className="flex items-center justify-between">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
              <Link
                href={resolvedParentHref}
                className="hover:text-blue-600 transition"
              >
                {resolvedParentLabel}
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-semibold">{label}</span>
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-slate-900">
              {label}
            </h1>
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
                {emptyLabel ||
                  (locale === "id"
                    ? "Belum ada data yang tersedia untuk ditampilkan saat ini. Silakan kembali beberapa saat lagi."
                    : "No data available at the moment. Please check back later.")}
              </p>
            </div>

            <Link
              href={resolvedParentHref}
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
    <div className="px-6 py-6">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link
              href={resolvedParentHref}
              className="hover:text-blue-600 transition text-nowrap"
            >
              {resolvedParentLabel}
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold text-nowrap">
              {label}
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-xl md:text-xl font-bold text-slate-900">
              {label}
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              {filteredBySearch.length} {nc.articles}
            </p>
          </div>
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
                <span className="text-xs flex items-center gap-2">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  {nc.searchBtn}
                </span>
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
            {nc.noResults}{" "}
            <span className="font-semibold">{searchTerm.trim()}</span>
          </p>
        </div>
      )}

      {/* Article Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginated.map((item, idx) => {
          const thumb = resolveImage(item.images?.[0]);
          const title = resolvePortalNewsTitle(item, locale, "Judul berita");
          const summary = stripHtml(
            resolvePortalNewsContent(item, locale),
          ).substring(0, 140);
          const date = new Date(
            item.updated_at ?? item.created_at ?? "",
          ).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          const badgeLabel = formatBadgeLabel(
            String(
              item.subcategory_label ??
                item.category_label ??
                item.kategori?.name ??
                item.main_category?.name ??
                item.sub_category?.name ??
                item.subcategory ??
                item.category ??
                resolveIndonesiaMarketNewsCategoryLabelFromItem(
                  item,
                  resolvedLocale,
                ) ??
                label,
            ),
          );

          const itemCategorySlug =
            resolveIndonesiaMarketNewsCategorySlugFromItem(item);
          const isItemEconomic = ECONOMIC_SLUGS.has(itemCategorySlug);
          const detailHref = buildDetailHref(
            item.slug,
            itemCategorySlug,
            isItemEconomic,
          );
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
                {/* Category badges */}
                <div className="absolute top-2 left-3 flex flex-wrap gap-1">
                  <div className="bg-blue-700/50 group-hover:bg-blue-700 rounded-full px-2 py-0.5 transition duration-300">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                      {badgeLabel}
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
                    href={detailHref}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
                  >
                    {nc.readMore.toUpperCase()}
                  </Link>
                  {/* Social share row */}
                  {(() => {
                    const articlePath = detailHref;
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
