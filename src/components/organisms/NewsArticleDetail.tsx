"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLoading } from "../providers/LoadingProvider";

const NEWS_API = "https://portalnews.newsmaker.id/api/v1/berita";
const NEWS_TOKEN = "Bearer EWF-06433b884f930161";
const IMAGE_BASE = "https://portalnews.newsmaker.id/";

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .trim();

type NewsArticleDetailProps = {
  slug: string;
  categorySlug: string;
  locale: string;
  isEconomic?: boolean;
};

export function NewsArticleDetail({
  slug,
  categorySlug,
  locale,
  isEconomic = false,
}: NewsArticleDetailProps) {
  const globalLoading = useLoading();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [heroImageError, setHeroImageError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = globalLoading.start("news-article-detail");
      try {
        const res = await fetch(NEWS_API, {
          headers: { Authorization: NEWS_TOKEN },
        });
        const json = await res.json();
        if (!json?.data) return;

        const all: any[] = json.data;

        // Find current article by slug
        const found = all.find((a) => a.slug === slug);
        setArticle(found ?? null);

        // Latest: most recent 5
        const sorted = [...all].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at).getTime() -
            new Date(a.updated_at || a.created_at).getTime(),
        );
        setLatest(sorted.slice(0, 5));

        // Popular: most recent 5 from same category (excluding current)
        if (found) {
          const sameCat = all.filter(
            (a) => a.category_id === found.category_id && a.slug !== slug,
          );
          setRelated(sameCat.slice(0, 3));
          setPopular(sameCat.slice(0, 5));
        } else {
          setPopular(sorted.slice(5, 10));
        }
      } catch (err) {
        console.error("Failed to fetch article", err);
      } finally {
        setLoading(false);
        globalLoading.stop(token);
      }
    };
    fetchData();
  }, [slug]);

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <i className="fa-solid fa-spinner fa-spin text-3xl mb-4"></i>
        <p className="text-sm font-semibold">Loading Article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-32">
        <i className="fa-solid fa-triangle-exclamation text-4xl text-slate-200 mb-4"></i>
        <p className="text-slate-500 font-semibold">Article not found.</p>
        <Link
          href={`/${locale}/${isEconomic ? "economic-news" : "news"}/${categorySlug}`}
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          ← Back to {categorySlug}
        </Link>
      </div>
    );
  }

  const title = article.titles?.default || article.title;
  const thumb = article.images?.[0]
    ? `${IMAGE_BASE}${article.images[0]}`
    : null;
  const catName =
    article.kategori?.name?.toUpperCase() ?? categorySlug.toUpperCase();
  const dateStr = new Date(
    article.updated_at || article.created_at,
  ).toLocaleDateString("id-ID", {
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

  const articlePath = `/${locale}/${isEconomic ? "economic-news" : "news"}/${categorySlug}/${article.slug}`;
  const articleUrl = `${getSiteOrigin()}${articlePath}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      {/* ── Main Article ── */}
      <article>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link
            href={`/${locale}/equities`}
            className="hover:text-blue-600 transition capitalize"
          >
            {isEconomic ? "Economic News" : "Market News"}
          </Link>
          <span>/</span>
          <Link
            href={`/${locale}/${isEconomic ? "economic-news" : "news"}/${categorySlug}`}
            className="hover:text-blue-600 transition capitalize"
          >
            {categorySlug.replace(/-/g, " ")}
          </Link>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[200px]">{title}</span>
        </nav>

        {/* Hero image */}
        {thumb && !heroImageError && (
          <div className="relative rounded-xl overflow-hidden mb-5 shadow-sm h-[420px]">
            <Image
              src={thumb}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover"
              onError={() => setHeroImageError(true)}
            />
          </div>
        )}

        {/* Date + share row */}
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
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
            className={`transition text-lg ${copiedLink ? "text-blue-600" : "hover:text-blue-500"}`}
          >
            <i
              className={`fa-solid ${copiedLink ? "fa-check" : "fa-link"}`}
            ></i>
          </button>
          {copiedLink && (
            <span className="text-[11px] text-blue-600 font-semibold animate-in fade-in">
              Copied!
            </span>
          )}
        </div>

        {/* Article Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-6">
          {title}
        </h1>

        {/* Category badge */}
        <span className="inline-block mb-6 rounded-sm bg-blue-100 text-blue-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
          {catName}
        </span>

        {/* Article body */}
        <div
          className="prose prose-slate max-w-none text-[15px] leading-relaxed
                        prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3
                        prose-p:mb-5 prose-p:text-slate-700
                        prose-strong:text-slate-800
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-ul:list-disc prose-ul:pl-6 prose-li:mb-1 space-y-3"
          dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
        />

        {/* Source */}
        {article.source && (
          <p className="mt-8 text-sm text-slate-500 border-t border-slate-100 pt-6">
            Sumber :{" "}
            <span className="font-medium text-slate-700">{article.source}</span>
          </p>
        )}

        {/* Related News */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-800 mb-1 pb-3 border-b-2 border-blue-700 inline-block">
              Related News
            </h2>
            <div className="mt-5 space-y-5">
              {related.map((rel, i) => {
                const relThumb = rel.images?.[0]
                  ? `${IMAGE_BASE}${rel.images[0]}`
                  : null;
                const relTitle = rel.titles?.default || rel.title;
                const relCat = rel.kategori?.name?.toUpperCase() ?? "";
                const relDate = new Date(
                  rel.updated_at || rel.created_at,
                ).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const relSummary = stripHtml(rel.content ?? "").substring(
                  0,
                  160,
                );

                return (
                  <Link
                    key={i}
                    href={`/${locale}/${isEconomic ? "economic-news" : "news"}/${categorySlug}/${rel.slug}`}
                    className="flex gap-5 group hover:bg-slate-50 rounded-xl p-3 -mx-3 transition"
                  >
                    {/* Thumbnail */}
                    <div className="w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
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
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-200 flex items-center justify-center">
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
            Latest News
          </h2>
          <div className="space-y-4">
            {latest.map((item, i) => {
              const t = item.titles?.default || item.title;
              const th = item.images?.[0]
                ? `${IMAGE_BASE}${item.images[0]}`
                : null;
              const cat = item.kategori?.name?.toUpperCase() ?? "";
              const d = new Date(
                item.updated_at || item.created_at,
              ).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Link
                  key={i}
                  href={`/${locale}/${isEconomic ? "economic-news" : "news"}/${item.kategori?.slug ?? categorySlug}/${item.slug}`}
                  className="flex gap-3 group hover:bg-slate-50 rounded-lg p-2 -mx-2 transition"
                >
                  <div className="w-16 h-14 flex-shrink-0 rounded-md overflow-hidden bg-slate-100">
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
            Popular News
          </h2>
          <div className="space-y-4">
            {popular.map((item, i) => {
              const t = item.titles?.default || item.title;
              const th = item.images?.[0]
                ? `${IMAGE_BASE}${item.images[0]}`
                : null;
              const cat = item.kategori?.name?.toUpperCase() ?? "";
              const d = new Date(
                item.updated_at || item.created_at,
              ).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Link
                  key={i}
                  href={`/${locale}/${isEconomic ? "economic-news" : "news"}/${item.kategori?.slug ?? categorySlug}/${item.slug}`}
                  className="flex gap-3 group hover:bg-slate-50 rounded-lg p-2 -mx-2 transition"
                >
                  <div className="w-16 h-14 flex-shrink-0 rounded-md overflow-hidden bg-slate-100">
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
