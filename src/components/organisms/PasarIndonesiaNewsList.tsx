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
import { resolvePortalNewsImageSrc } from "@/lib/portalnews-image-proxy";

import type { Messages } from "@/locales";

type PasarIndonesiaNewsListProps = {
  locale: string;
  detailBasePath?: string;
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

type NewsListPayload = {
  status?: string;
  imageBase?: string;
  data?: NewsListItem[];
  count?: number;
};

// Strip HTML helper
const stripHtml = (html: string) => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .trim();
};

const formatDate = (value: string | undefined, locale: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function PasarIndonesiaNewsList({
  locale,
  detailBasePath,
  messages,
  parentHref,
  parentLabel,
}: PasarIndonesiaNewsListProps) {
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
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 16;

  const normalizedDetailBasePath = detailBasePath
    ?.replace(/^\/+/, "")
    .replace(/\/+$/, "");

  useEffect(() => {
    let isActive = true;

    const fetchArticles = async () => {
      const token = start("pasar-indonesia-news-list");
      try {
        const params = new URLSearchParams({
          limit: perPage.toString(),
        });

        if (page > 1) {
          params.set("offset", ((page - 1) * perPage).toString());
        }

        const response = await fetch(
          `/api/portalnews/pasar-indonesia?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        const json = (await response
          .json()
          .catch(() => null)) as NewsListPayload | null;

        if (isActive && json?.data) {
          setArticles(json.data);
          setTotalCount(json.count ?? json.data.length);
          if (typeof json.imageBase === "string") {
            setImageBase(json.imageBase);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Pasar Indonesia news", err);
      } finally {
        if (isActive) {
          setLoading(false);
          stop(token);
        }
      }
    };

    void fetchArticles();

    return () => {
      isActive = false;
    };
  }, [page, start, stop]);

  // Filter articles based on search term
  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles;

    const term = searchTerm.toLowerCase();
    return articles.filter((article) => {
      const title = resolvePortalNewsTitle(article, locale, "").toLowerCase();
      const content = stripHtml(
        resolvePortalNewsContent(article, locale, ""),
      ).toLowerCase();

      return title.includes(term) || content.includes(term);
    });
  }, [articles, searchTerm, locale]);

  const totalPages = Math.ceil(totalCount / perPage);

  const renderArticleCard = (article: NewsListItem) => {
    const articleSlug = article.slug?.trim();
    const title = resolvePortalNewsTitle(article, locale, "Judul berita");
    const summary = stripHtml(resolvePortalNewsContent(article, locale, ""));
    const formattedDate = formatDate(
      article.updated_at ?? article.created_at,
      locale,
    );

    const href = articleSlug
      ? `/${locale}/${normalizedDetailBasePath}/${articleSlug}`
      : undefined;

    const rawImageUrl = article.images?.[0]
      ? article.images[0].startsWith("http")
        ? article.images[0]
        : imageBase
          ? `${imageBase}/${article.images[0]}`
          : `./assets/Screenshot-2024-10-29-at-11.27.48.png`
      : `./assets/Screenshot-2024-10-29-at-11.27.48.png`;

    const imageUrl = resolvePortalNewsImageSrc(rawImageUrl) ?? rawImageUrl;

    return (
      <article
        key={`article-${article.id || Math.random()}`}
        className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
      >
        <div className="aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={225}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <time dateTime={article.created_at}>{formattedDate}</time>
          </div>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900">
            {href ? (
              <Link
                href={href}
                className="hover:text-blue-600 focus:text-blue-600"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          <p className="line-clamp-3 text-sm text-slate-600">
            {summary ? `${summary.substring(0, 150)}...` : ""}
          </p>
          {href && (
            <div className="mt-3">
              <Link
                href={href}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 focus:text-blue-700"
              >
                {nc.readMore}
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Latest News</h2>
          <p className="text-slate-600">
            {locale === "en"
              ? "Latest news and updates from Indonesia market"
              : "Berita terbaru dan update dari pasar Indonesia"}
          </p>
        </div>

        {/* Search Toggle */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {nc.searchBtn}
        </button>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={nc.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {nc.closeSearch}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-video bg-slate-200" />
              <div className="p-4">
                <div className="mb-2 h-4 w-20 rounded bg-slate-200" />
                <div className="mb-2 h-6 w-full rounded bg-slate-200" />
                <div className="mb-1 h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {!loading && filteredArticles.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredArticles.map(renderArticleCard)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-slate-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-slate-900">
            {searchTerm ? nc.noResults : nc.loadingArticles}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm
              ? `${nc.noResults} "${searchTerm}"`
              : locale === "en"
                ? "No news articles available yet."
                : "Belum ada artikel berita."}
          </p>
        </div>
      )}
    </div>
  );
}
