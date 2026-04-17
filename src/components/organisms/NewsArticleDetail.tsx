"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLoading } from "../providers/LoadingProvider";
import type { Messages } from "@/locales";
import { resolvePortalNewsImageSrc } from "@/lib/portalnews-image-proxy";
import { RotatingAdSlot } from "@/components/molecules/RotatingAdSlot";
import { SectionHeader } from "../molecules/SectionHeader";
import { Card } from "../atoms/Card";

const formatArticleHtml = (value: string) =>
  value
    .replace(/<o:p\b[^>]*>[\s\S]*?<\/o:p>/gi, "")
    .replace(/\s(?:class|style|lang|align)=(["']).*?\1/gi, "")
    .replace(/\s(?:class|style|lang|align)=([^\s>]+)/gi, "")
    .replace(/<p>\s*(?:&nbsp;|\s|<br\s*\/?>)*<\/p>/gi, "");

const rewritePortalNewsHtmlImages = (html: string, imageBase?: string) => {
  if (typeof DOMParser === "undefined") return html;
  const normalizedHtml = String(html ?? "");
  if (!normalizedHtml.trim()) return normalizedHtml;

  let baseOrigin = "";
  if (imageBase) {
    try {
      baseOrigin = new URL(imageBase).origin;
    } catch {
      baseOrigin = "";
    }
  }

  const resolveWithBase = (src: string) => {
    const trimmed = src.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("data:") || trimmed.startsWith("blob:"))
      return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;

    if (trimmed.startsWith("http")) return trimmed;

    if (baseOrigin) {
      try {
        return new URL(trimmed, `${baseOrigin}/`).toString();
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  };

  const rewriteSrcset = (raw: string) => {
    const items = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    const rewritten = items.map((entry) => {
      const [url, descriptor] = entry.split(/\s+/, 2);
      const resolved = resolvePortalNewsImageSrc(resolveWithBase(url)) ?? url;
      return descriptor ? `${resolved} ${descriptor}` : resolved;
    });

    return rewritten.join(", ");
  };

  const doc = new DOMParser().parseFromString(
    `<div>${normalizedHtml}</div>`,
    "text/html",
  );

  doc.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");
    if (src) {
      const resolved = resolvePortalNewsImageSrc(resolveWithBase(src));
      if (resolved) img.setAttribute("src", resolved);
    }

    const srcset = img.getAttribute("srcset");
    if (srcset) {
      const resolved = rewriteSrcset(srcset);
      if (resolved) img.setAttribute("srcset", resolved);
    }
  });

  doc.querySelectorAll("source").forEach((source) => {
    const srcset = source.getAttribute("srcset");
    if (srcset) {
      const resolved = rewriteSrcset(srcset);
      if (resolved) source.setAttribute("srcset", resolved);
    }
  });

  return doc.body.innerHTML;
};

type NewsArticleAuthor =
  | string
  | {
      id?: number;
      name?: string;
      email?: string;
    };

type NewsArticleItem = {
  id?: number;
  type?: string;
  slug?: string;
  image?: string;
  image_url?: string;
  title_id?: string;
  title_en?: string;
  content_id?: string;
  content_en?: string;
  category?: string;
  category_label?: string;
  source?: string;
  author?: NewsArticleAuthor;
  created_at?: string;
  updated_at?: string;
};

const resolveAuthorName = (author?: NewsArticleAuthor) => {
  if (!author) return "";
  if (typeof author === "string") return author.trim();
  return author.name?.trim() || "";
};

type NewsArticlePayload = {
  status?: string;
  imageBase?: string;
  data?: NewsArticleItem | null;
  latest?: NewsArticleItem[];
  related?: NewsArticleItem[];
};

type NewsArticleDetailProps = {
  slug: string;
  categorySlug?: string;
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

const resolveTitle = (
  article: NewsArticleItem | null | undefined,
  locale: string,
  fallback = "Judul berita",
) => {
  if (!article) return fallback;

  if (locale === "en") {
    return article.title_en?.trim() || article.title_id?.trim() || fallback;
  }

  return article.title_id?.trim() || article.title_en?.trim() || fallback;
};

const resolveContent = (
  article: NewsArticleItem | null | undefined,
  locale: string,
  fallback = "",
) => {
  if (!article) return fallback;

  if (locale === "en") {
    return article.content_en?.trim() || article.content_id?.trim() || fallback;
  }

  return article.content_id?.trim() || article.content_en?.trim() || fallback;
};

const formatArticleDateTime = (value: string | undefined, locale: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const dateLocale = locale === "id" ? "id-ID" : "en-US";

  const dateParts = new Intl.DateTimeFormat(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(parsed);

  const timeParts = new Intl.DateTimeFormat(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(parsed);

  const getPart = (
    parts: Intl.DateTimeFormatPart[],
    type: Intl.DateTimeFormatPartTypes,
  ) => parts.find((part) => part.type === type)?.value;

  const weekday = getPart(dateParts, "weekday");
  const day = getPart(dateParts, "day");
  const month = getPart(dateParts, "month");
  const year = getPart(dateParts, "year");

  const hour = getPart(timeParts, "hour");
  const minute = getPart(timeParts, "minute");

  if (!weekday || !day || !month || !year || !hour || !minute) return "";

  return `${weekday}, ${day} ${month} ${year} ${hour}.${minute}`;
};

const htmlToPlainText = (html: string) => {
  const normalized = String(html ?? "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|header|footer|h[1-6])>/gi, "\n\n")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    .replace(/<[^>]+>/g, " ");

  const decoded =
    typeof DOMParser === "undefined"
      ? normalized
      : (new DOMParser().parseFromString(
          `<div>${normalized}</div>`,
          "text/html",
        ).body.textContent ?? normalized);

  const lines = decoded
    .replace(/\u00A0/g, " ")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .reduce<string[]>((acc, line) => {
      if (!line) {
        if (acc[acc.length - 1] === "") return acc;
        acc.push("");
        return acc;
      }
      acc.push(line);
      return acc;
    }, []);

  return lines.join("\n").trim();
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

  const nc = messages?.equities?.newsCategories ?? {
    marketNewsTitle: "Market News",
    economicNewsTitle: "Economic News",
    latestNews: "Latest News",
    popularNews: "Berita Terkait",
    relatedNews: "Berita Terkait",
    loadingArticle: "Loading Article...",
    articleNotFound: "Article not found.",
    backTo: "← Back to",
    source: "Source",
    copied: "Copied!",
    searchBtn: "Search",
    closeSearch: "Close",
    searchNews: "Search News",
    by: locale === "en" ? "by" : "oleh",
  };

  const [article, setArticle] = useState<NewsArticleItem | null>(
    initialData?.data ?? null,
  );
  const [related, setRelated] = useState<NewsArticleItem[]>(
    Array.isArray(initialData?.related) ? initialData.related : [],
  );
  const [latest, setLatest] = useState<NewsArticleItem[]>(
    Array.isArray(initialData?.latest) ? initialData.latest : [],
  );
  const [loading, setLoading] = useState(!initialData);
  const [heroImageError, setHeroImageError] = useState(false);
  const [imageBase, setImageBase] = useState(initialData?.imageBase ?? "");
  const [linkCopied, setLinkCopied] = useState(false);
  const copyScopeRef = useRef<HTMLDivElement | null>(null);

  const normalizedDetailBasePath = detailBasePath
    ?.replace(/^\/+/, "")
    .replace(/\/+$/, "");

  useEffect(() => {
    if (initialData) {
      setArticle(initialData.data ?? null);
      setLatest(Array.isArray(initialData.latest) ? initialData.latest : []);
      setRelated(Array.isArray(initialData.related) ? initialData.related : []);
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
          `/api/portalnews/pasar-indonesia?slug=${encodeURIComponent(
            slug,
          )}&latestLimit=5&relatedLimit=5`,
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

  const resolveImage = (item?: NewsArticleItem | null) => {
    const imageUrl = item?.image_url?.trim();
    if (imageUrl) return resolvePortalNewsImageSrc(imageUrl);

    const imagePath = item?.image?.trim();
    if (!imagePath) return null;

    if (imagePath.startsWith("http"))
      return resolvePortalNewsImageSrc(imagePath);

    const normalizedPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
    const base = imageBase?.replace(/\/$/, "") ?? "";

    const full = base ? `${base}${normalizedPath}` : normalizedPath;
    return resolvePortalNewsImageSrc(full);
  };

  const defaultListingHref = `/${locale}/${isEconomic ? "economic-news" : "news"}`;

  const resolvedListingHref =
    listingHref ??
    (normalizedDetailBasePath
      ? `/${locale}/${normalizedDetailBasePath}`
      : defaultListingHref);

  const resolvedListingLabel =
    listingLabel ?? (isEconomic ? nc.economicNewsTitle : nc.marketNewsTitle);

  const buildArticleHref = (articleSlug?: string) => {
    const normalizedSlug = articleSlug?.trim();

    if (normalizedDetailBasePath) {
      return normalizedSlug
        ? `/${locale}/${normalizedDetailBasePath}/${normalizedSlug}`
        : resolvedListingHref;
    }

    return normalizedSlug
      ? `/${locale}/${isEconomic ? "economic-news" : "news"}/${categorySlug ?? "pasar-indonesia"}/${normalizedSlug}`
      : resolvedListingHref;
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

  const title = resolveTitle(article, locale, "Judul berita");
  const articleContent = resolveContent(article, locale, "");
  const articleHtml = rewritePortalNewsHtmlImages(
    formatArticleHtml(articleContent),
    imageBase,
  );
  const thumb = resolveImage(article);

  const dateStr = formatArticleDateTime(
    article.updated_at ?? article.created_at,
    locale,
  );

  const getSiteOrigin = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL)
      return process.env.NEXT_PUBLIC_SITE_URL;
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  };

  const articlePath = buildArticleHref(article.slug ?? slug);
  const articleUrl = `${getSiteOrigin()}${articlePath}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);
  const authorName = resolveAuthorName(article.author);
  const sourceName = article.source?.trim() || "";
  const attributionPlain =
    locale === "en"
      ? `Read the full article on ${sourceName || "Newsmaker"}, "${title}" here: ${articleUrl}`
      : `Baca artikel ${sourceName || "Newsmaker"}, "${title}" selengkapnya ${articleUrl}`;

  const buildCopyPayload = () => {
    const selection = window.getSelection();
    let selectedPlain = (selection?.toString() ?? "").trim();

    try {
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const fragment = range.cloneContents();
        const div = document.createElement("div");
        div.appendChild(fragment);
        selectedPlain = htmlToPlainText(div.innerHTML);
      }
    } catch {
      selectedPlain = (selection?.toString() ?? "").trim();
    }

    const plain = selectedPlain
      ? `${selectedPlain}\n\n${attributionPlain}`
      : attributionPlain;

    const html = `<div style="white-space:pre-wrap;font-family:inherit">${escapeHtml(
      plain,
    )}</div>`;

    return { plain, html };
  };

  const handleCopy = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    if (selection.rangeCount === 0) return;

    const scope = copyScopeRef.current;
    if (!scope) return;

    const range = selection.getRangeAt(0);
    const commonNode = range.commonAncestorContainer;
    const commonElement =
      commonNode.nodeType === Node.ELEMENT_NODE
        ? (commonNode as Element)
        : commonNode.parentElement;

    if (!commonElement || !scope.contains(commonElement)) return;

    event.preventDefault();

    const payload = buildCopyPayload();
    event.clipboardData.setData("text/plain", payload.plain);
    event.clipboardData.setData("text/html", payload.html);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(articleUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = articleUrl;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1200);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="min-w-0 rounded-2xl bg-white shadow-sm">
        <div className="p-5 sm:p-7">
          <nav className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-6 sm:text-xs">
            {parentHref && parentLabel ? (
              <>
                <Link
                  href={parentHref}
                  className="hover:text-blue-600 transition"
                >
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

            <span>/</span>
            <span className="text-slate-600 truncate">{title}</span>
          </nav>

          <h1 className="text-center text-xl w-full max-w-none font-bold leading-tight text-blue-800 md:text-4xl">
            {title}
          </h1>

          <div className="mt-3 flex flex-col items-center gap-1 text-center">
            {authorName || sourceName ? (
              <p className="text-sm text-slate-500">
                {authorName ? (
                  <span className="font-medium text-slate-700">
                    {authorName}
                  </span>
                ) : null}
                {authorName && sourceName ? (
                  <span className="px-2 text-slate-300">-</span>
                ) : null}
                {sourceName ? (
                  <span className="font-semibold text-rose-600">
                    {sourceName}
                  </span>
                ) : null}
              </p>
            ) : null}

            {dateStr ? (
              <p className="text-xs text-slate-400">{dateStr}</p>
            ) : null}

            <span className="mt-4 h-px w-24 bg-slate-200" />
          </div>

          {thumb && !heroImageError && (
            <div className="relative mx-auto mt-6 w-full aspect-video overflow-hidden rounded-xl shadow-lg">
              <Image
                src={thumb}
                alt={title}
                fill
                sizes="(max-width: 1080px) 100vw, 900px"
                className="object-cover"
                quality={100}
                priority
                unoptimized
                onError={() => setHeroImageError(true)}
              />
            </div>
          )}

          {sourceName ? (
            <p className="mx-auto mt-2 w-full text-xs text-slate-400">
              {nc.source}: <span className="text-slate-500">{sourceName}</span>
            </p>
          ) : null}

          <div
            ref={copyScopeRef}
            onCopy={handleCopy}
            className="news-article-prose prose prose-slate mt-8 w-full max-w-none text-[15px] leading-8 sm:text-base
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

          <div className="mt-10 w-full border-t-2 border-slate-200 pt-6">
            <div className="flex flex-col items-center max-w-3xl gap-3">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                {locale === "en" ? "Share:" : "Bagikan:"}
              </p>
              <div className="flex flex-wrap items-center justify-start gap-4 text-slate-400">
                <a
                  href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share to WhatsApp"
                  className="hover:text-green-500 transition"
                >
                  <i className="fa-brands fa-whatsapp text-xl"></i>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share to Facebook"
                  className="hover:text-blue-600 transition"
                >
                  <i className="fa-brands fa-facebook text-xl"></i>
                </a>

                <a
                  href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share to X"
                  className="hover:text-slate-800 transition"
                >
                  <i className="fa-brands fa-x-twitter text-xl"></i>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="hover:text-slate-800 transition"
                  title={locale === "en" ? "Copy link" : "Salin tautan"}
                >
                  <i className="fa-solid fa-link text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <aside className="space-y-8">
        <div className="bg-white rounded-lg border border-blue-300 shadow-sm shadow-blue-300/50">
          <SectionHeader title={nc.latestNews} />
          <div className="space-y-4 p-4">
            {latest.map((item, i) => {
              const t = resolveTitle(item, locale, "Judul berita");
              const th = resolveImage(item);
              const cat =
                item.category_label?.toUpperCase() ??
                item.category?.replace(/-/g, " ").toUpperCase() ??
                "";
              const formattedDate = formatArticleDateTime(
                item.updated_at ?? item.created_at,
                locale,
              );

              return (
                <Link
                  key={item.id ?? item.slug ?? i}
                  href={buildArticleHref(item.slug)}
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
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formattedDate}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {related.length > 0 && (
          <div className="bg-white rounded-lg border border-blue-300 shadow-sm shadow-blue-300/50">
            <SectionHeader title={nc.popularNews} />
            <div className="space-y-4 p-4">
              {related.map((item, i) => {
                const t = resolveTitle(item, locale, "Judul berita");
                const th = resolveImage(item);
                const cat =
                  item.category_label?.toUpperCase() ??
                  item.category?.replace(/-/g, " ").toUpperCase() ??
                  "";
                const formattedDate = formatArticleDateTime(
                  item.updated_at ?? item.created_at,
                  locale,
                );

                return (
                  <Link
                    key={item.id ?? item.slug ?? i}
                    href={buildArticleHref(item.slug)}
                    className="flex gap-3 group hover:bg-slate-50 rounded-lg p-2 -mx-2 transition"
                  >
                    <div className="w-16 h-14 shrink-0 rounded-md overflow-hidden bg-slate-100">
                      {th ? (
                        <img
                          src={th}
                          alt={t}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
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
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formattedDate}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"> */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <RotatingAdSlot
            slot="news-article-sidebar"
            rotationKey={`${locale}:${slug}`}
            locale={locale}
          />
        </div>
      </aside>
    </div>
  );
}
