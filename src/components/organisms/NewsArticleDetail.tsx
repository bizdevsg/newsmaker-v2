"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLoading } from "../providers/LoadingProvider";
import type { Messages } from "@/locales";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .trim();

const formatArticleHtml = (value: string) =>
  value
    .replace(/<o:p\b[^>]*>[\s\S]*?<\/o:p>/gi, "")
    .replace(/\s(?:class|style|lang|align)=(["']).*?\1/gi, "")
    .replace(/\s(?:class|style|lang|align)=([^\s>]+)/gi, "")
    .replace(/<p>\s*(?:&nbsp;|\s|<br\s*\/?>)*<\/p>/gi, "");

type NewsArticleDetailProps = {
  slug: string;
  categorySlug: string;
  initialData?: NewsArticlePayload;
  locale: string;
  isEconomic?: boolean;
  detailBasePath?: string;
  parentHref?: string;
  parentLabel?: string;
  listingHref?: string;
  listingLabel?: string;
  messages?: Messages;
};

type NewsArticleItem = {
  id?: number;
  title?: string;
  titles?: {
    default?: string;
  };
  content?: string;
  slug?: string;
  source?: string;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
  images?: string[];
  kategori?: {
    name?: string;
    slug?: string;
  };
};

type NewsArticlePayload = {
  status?: string;
  imageBase?: string;
  data?: NewsArticleItem | null;
  latest?: NewsArticleItem[];
  related?: NewsArticleItem[];
  popular?: NewsArticleItem[];
};

export function NewsArticleDetail({
  slug,
  categorySlug,
  initialData,
  locale,
  isEconomic = false,
  detailBasePath,
  parentHref,
  parentLabel,
  listingHref,
  listingLabel,
  messages,
}: NewsArticleDetailProps) {
  const { start, stop } = useLoading();

  // Bilingual labels
  const nc = messages?.equities?.newsCategories ?? {
    marketNewsTitle: "Market News",
    economicNewsTitle: "Economic News",
    latestNews: "Latest News",
    popularNews: "Popular News",
    relatedNews: "Related News",
    loadingArticle: "Loading Article...",
    articleNotFound: "Article not found.",
    backTo: "← Back to",
    source: "Source",
    copied: "Copied!",
    searchBtn: "Search",
    closeSearch: "Close",
    searchNews: "Search News",
  };

  const dateLocale = locale === "id" ? "id-ID" : "en-US";

  const [article, setArticle] = useState<NewsArticleItem | null>(
    initialData?.data ?? null,
  );
  const [related, setRelated] = useState<NewsArticleItem[]>(
    Array.isArray(initialData?.related) ? initialData.related : [],
  );
  const [latest, setLatest] = useState<NewsArticleItem[]>(
    Array.isArray(initialData?.latest) ? initialData.latest : [],
  );
  const [popular, setPopular] = useState<NewsArticleItem[]>(
    Array.isArray(initialData?.popular) ? initialData.popular : [],
  );
  const [loading, setLoading] = useState(!initialData);
  const [copiedLink, setCopiedLink] = useState(false);
  const [heroImageError, setHeroImageError] = useState(false);
  const [imageBase, setImageBase] = useState(initialData?.imageBase ?? "");
  const normalizedDetailBasePath = detailBasePath
    ?.replace(/^\/+/, "")
    .replace(/\/+$/, "");

  useEffect(() => {
    if (initialData) {
      setArticle(initialData.data ?? null);
      setLatest(Array.isArray(initialData.latest) ? initialData.latest : []);
      setRelated(Array.isArray(initialData.related) ? initialData.related : []);
      setPopular(Array.isArray(initialData.popular) ? initialData.popular : []);
      setImageBase(
        typeof initialData.imageBase === "string" ? initialData.imageBase : "",
      );
      setLoading(false);
      return;
    }

    let isActive = true;

    const fetchData = async () => {
      const token = start("news-article-detail");
      try {
        const res = await fetch(
          `/api/portalnews?slug=${encodeURIComponent(slug)}&latestLimit=5&relatedLimit=3&popularLimit=5`,
          {
            cache: "no-store",
          },
        );
        const json = (await res
          .json()
          .catch(() => null)) as NewsArticlePayload | null;
        if (!res.ok || !json) return;
        if (!isActive) return;

        setArticle(json.data ?? null);
        setLatest(Array.isArray(json.latest) ? json.latest : []);
        setRelated(Array.isArray(json.related) ? json.related : []);
        setPopular(Array.isArray(json.popular) ? json.popular : []);
        setImageBase(typeof json.imageBase === "string" ? json.imageBase : "");
      } catch (err) {
        console.error("Failed to fetch article", err);
      } finally {
        if (isActive) {
          setLoading(false);
        }
        stop(token);
      }
    };
    fetchData();

    return () => {
      isActive = false;
    };
  }, [initialData, slug, start, stop]);

  const resolveImage = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const fallbackBase =
      process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE?.replace(/\/$/, "") ?? "";
    const base = imageBase || fallbackBase;

    return base ? `${base}${normalizedPath}` : normalizedPath;
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const defaultListingHref = `/${locale}/${isEconomic ? "economic-news" : "news"}`;
  const resolvedListingHref =
    listingHref ??
    (normalizedDetailBasePath
      ? `/${locale}/${normalizedDetailBasePath}`
      : defaultListingHref);
  const resolvedListingLabel =
    listingLabel ??
    (isEconomic ? nc.economicNewsTitle : nc.marketNewsTitle);

  const buildArticleHref = (
    articleSlug: string | undefined,
    itemCategorySlug: string,
  ) => {
    const normalizedSlug = articleSlug?.trim();

    if (normalizedDetailBasePath) {
      return normalizedSlug
        ? `/${locale}/${normalizedDetailBasePath}/${normalizedSlug}`
        : resolvedListingHref;
    }

    return `/${locale}/${isEconomic ? "economic-news" : "news"}/${itemCategorySlug}/${normalizedSlug ?? ""}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <i className="fa-solid fa-spinner fa-spin text-3xl mb-4"></i>
        <p className="text-sm font-semibold">{nc.loadingArticle}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-32">
        <i className="fa-solid fa-triangle-exclamation text-4xl text-slate-200 mb-4"></i>
        <p className="text-slate-500 font-semibold">{nc.articleNotFound}</p>
        <Link
          href={resolvedListingHref}
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          {nc.backTo} {resolvedListingLabel}
        </Link>
      </div>
    );
  }

  const title = resolvePortalNewsTitle(article, locale, "Judul berita");
  const articleContent = resolvePortalNewsContent(article, locale, "");
  const articleHtml = formatArticleHtml(articleContent);
  const thumb = resolveImage(article.images?.[0]);
  const articleCategorySlug = article.kategori?.slug ?? categorySlug;
  const catName =
    article.kategori?.name?.toUpperCase() ?? articleCategorySlug.toUpperCase();
  const dateStr = new Date(
    article.updated_at ?? article.created_at ?? "",
  ).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const getSiteOrigin = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL)
      return process.env.NEXT_PUBLIC_SITE_URL;
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  };

  const articlePath = buildArticleHref(article.slug ?? slug, articleCategorySlug);
  const articleUrl = `${getSiteOrigin()}${articlePath}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      {/* ── Main Article ── */}
      <article>
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-6 sm:text-xs">
          {parentHref && parentLabel ? (
            <>
              <Link href={parentHref} className="hover:text-blue-600 transition">
                {parentLabel}
              </Link>
              <span>/</span>
            </>
          ) : null}
          <Link
            href={resolvedListingHref}
            className="hover:text-blue-600 transition capitalize"
          >
            {resolvedListingLabel}
          </Link>
          {!normalizedDetailBasePath ? (
            <>
              <span>/</span>
              <Link
                href={`/${locale}/${isEconomic ? "economic-news" : "news"}/${articleCategorySlug}`}
                className="hover:text-blue-600 transition capitalize"
              >
                {articleCategorySlug.replace(/-/g, " ")}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[12rem] sm:max-w-[18rem]">
            {title}
          </span>
        </nav>

        {/* Hero image */}
        {thumb && !heroImageError && (
          <div className="relative rounded-xl overflow-hidden mb-5 shadow-sm h-56 sm:h-72 lg:h-105">
            <Image
              src={thumb}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover"
              quality={100}
              priority
              unoptimized
              onError={() => setHeroImageError(true)}
            />
          </div>
        )}

        {/* Date + share row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-4">
          <span>
            <i className="fa-regular fa-calendar mr-1.5"></i>
            {dateStr}
          </span>
          <span className="text-slate-200">|</span>
          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share to WhatsApp"
            className="hover:text-green-500 transition"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i>
          </a>
          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share to Facebook"
            className="hover:text-blue-600 transition"
          >
            <i className="fa-brands fa-facebook text-lg"></i>
          </a>
          {/* X / Twitter */}
          <a
            href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share to X"
            className="hover:text-slate-800 transition"
          >
            <i className="fa-brands fa-x-twitter text-lg"></i>
          </a>
          {/* Copy link */}
          <button
            onClick={copyLink}
            title="Copy link"
            className={`transition text-lg cursor-pointer ${copiedLink ? "text-blue-600" : "hover:text-blue-500"}`}
          >
            <i
              className={`fa-solid ${copiedLink ? "fa-check" : "fa-link"}`}
            ></i>
          </button>
          {copiedLink && (
            <span className="text-[11px] text-blue-600 font-semibold animate-in fade-in">
              {nc.copied}
            </span>
          )}
        </div>

        {/* Article Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">
          {title}
        </h1>

        {/* Category badge */}
        <span className="inline-block rounded-sm bg-blue-100 text-blue-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
          ~ {catName} ~
        </span>

        {/* Article body */}
        <div
          className="news-article-prose prose prose-slate max-w-none text-[15px] leading-8 sm:text-base
                        prose-headings:font-display prose-headings:font-semibold prose-headings:text-slate-900
                        prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-t prose-h2:border-slate-200 prose-h2:pt-8 prose-h2:text-2xl
                        prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl
                        prose-h4:mt-6 prose-h4:mb-2 prose-h4:text-lg
                        prose-p:my-5 prose-p:text-slate-700 prose-p:leading-8
                        prose-strong:font-semibold prose-strong:text-slate-900
                        prose-a:font-semibold prose-a:text-blue-700 prose-a:no-underline hover:prose-a:text-blue-800 hover:prose-a:underline
                        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                        prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                        prose-li:text-slate-700 prose-li:marker:text-blue-700
                        prose-blockquote:rounded-r-2xl prose-blockquote:border-l-4 prose-blockquote:border-blue-700 prose-blockquote:bg-blue-50/80 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:text-slate-700
                        prose-hr:my-8 prose-hr:border-slate-200"
          dangerouslySetInnerHTML={{ __html: articleHtml }}
        />

        {/* Source */}
        {article.source && (
          <p className="mt-8 text-sm text-slate-500 border-t border-slate-100 pt-6">
            {nc.source}:{" "}
            <span className="font-medium text-slate-700">{article.source}</span>
          </p>
        )}

        {/* Related News */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-800 mb-1 pb-3 border-b-2 border-blue-700 inline-block">
              {nc.relatedNews}
            </h2>
            <div className="mt-5 space-y-5">
              {related.map((rel, i) => {
                const relThumb = resolveImage(rel.images?.[0]);
                const relTitle = resolvePortalNewsTitle(
                  rel,
                  locale,
                  "Judul berita",
                );
                const relCat = rel.kategori?.name?.toUpperCase() ?? "";
                const relCategorySlug =
                  rel.kategori?.slug ?? articleCategorySlug;
                const relDate = new Date(
                  rel.updated_at ?? rel.created_at ?? "",
                ).toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const relSummary = stripHtml(
                  resolvePortalNewsContent(rel, locale),
                ).substring(0, 160);

                return (
                  <Link
                    key={i}
                    href={buildArticleHref(rel.slug, relCategorySlug)}
                    className="flex flex-col gap-4 group hover:bg-slate-50 rounded-xl p-3 -mx-3 transition sm:flex-row sm:gap-5"
                  >
                    {/* Thumbnail */}
                    <div className="w-full h-40 shrink-0 rounded-lg overflow-hidden bg-slate-100 sm:w-40 sm:h-28">
                      {relThumb ? (
                        <img
                          src={relThumb}
                          alt={relTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://archive.org/download/placeholder-image/placeholder-image.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-blue-100 to-slate-200 flex items-center justify-center">
                          <i className="fa-solid fa-newspaper text-slate-300 text-2xl"></i>
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                        {relCat}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug mt-1 mb-1.5 line-clamp-2 group-hover:text-blue-700 transition">
                        {relTitle}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                        {relSummary}…
                      </p>
                      <p className="text-[11px] text-slate-400">{relDate}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>

      {/* ── Sidebar ── */}
      <aside className="space-y-8">
        {/* Latest News */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
            {nc.latestNews}
          </h2>
          <div className="space-y-4">
            {latest.map((item, i) => {
              const t = resolvePortalNewsTitle(item, locale, "Judul berita");
              const th = resolveImage(item.images?.[0]);
              const cat = item.kategori?.name?.toUpperCase() ?? "";
              const itemCategorySlug =
                item.kategori?.slug ?? articleCategorySlug;
              const d = new Date(
                item.updated_at ?? item.created_at ?? "",
              ).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Link
                  key={i}
                  href={buildArticleHref(item.slug, itemCategorySlug)}
                  className="flex gap-3 group hover:bg-slate-50 rounded-lg p-2 -mx-2 transition"
                >
                  <div className="w-16 h-14 shrink-0 rounded-md overflow-hidden bg-slate-100">
                    {th ? (
                      <img
                        src={th}
                        alt={t}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <i className="fa-solid fa-newspaper text-slate-400 text-xs"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">
                      {cat}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2 group-hover:text-blue-700 transition">
                      {t}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{d}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Popular News */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
            {nc.popularNews}
          </h2>
          <div className="space-y-4">
            {popular.map((item, i) => {
              const t = resolvePortalNewsTitle(item, locale, "Judul berita");
              const th = resolveImage(item.images?.[0]);
              const cat = item.kategori?.name?.toUpperCase() ?? "";
              const itemCategorySlug =
                item.kategori?.slug ?? articleCategorySlug;
              const d = new Date(
                item.updated_at ?? item.created_at ?? "",
              ).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Link
                  key={i}
                  href={buildArticleHref(item.slug, itemCategorySlug)}
                  className="flex gap-3 group hover:bg-slate-50 rounded-lg p-2 -mx-2 transition"
                >
                  <div className="w-16 h-14 shrink-0 rounded-md overflow-hidden bg-slate-100">
                    {th ? (
                      <img
                        src={th}
                        alt={t}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <i className="fa-solid fa-newspaper text-slate-400 text-xs"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">
                      {cat}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2 group-hover:text-blue-700 transition">
                      {t}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{d}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
