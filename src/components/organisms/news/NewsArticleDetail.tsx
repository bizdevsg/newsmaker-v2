"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { resolvePortalNewsImageSrc } from "@/lib/portalnews-image-proxy";
import type { NewsCardItem } from "@/lib/news-cards";
import { Card } from "@/components/atoms/Card";
import Image from "next/image";
import { SectionHeader } from "@/components/molecules/SectionHeader";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type NewsArticleDetailProps = {
  locale: "en" | "id";
  title: string;
  html: string;
  imageUrl?: string | null;
  badgeLabel?: string | null;
  authorLabel?: string | null;
  sourceLabel?: string | null;
  publishedAt?: string | null;
  breadcrumb: BreadcrumbItem[];
  shareHref: string;
  latestItems?: NewsCardItem[] | null;
  popularItems?: NewsCardItem[] | null;
  relatedItems?: NewsCardItem[] | null;
};

const PLACEHOLDER_IMAGE_URL =
  "https://archive.org/download/placeholder-image/placeholder-image.jpg";

const getSiteOrigin = () => {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

const formatArticleHtml = (value: string) =>
  String(value ?? "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<o:p\b[^>]*>[\s\S]*?<\/o:p>/gi, "")
    .replace(/\s(?:class|style|lang|align)=(["']).*?\1/gi, "")
    .replace(/\s(?:class|style|lang|align)=([^\s>]+)/gi, "")
    .replace(/<p>\s*(?:&nbsp;|\s|<br\s*\/?>)*<\/p>/gi, "");

const formatArticleDateTime = (
  value: string | null | undefined,
  locale: string,
) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const dateLocale = locale === "id" ? "id-ID" : "en-US";
  const date = new Intl.DateTimeFormat(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);

  const time = new Intl.DateTimeFormat(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);

  return `${date} ${time}`;
};

export function NewsArticleDetail({
  locale,
  title,
  html,
  imageUrl,
  badgeLabel,
  authorLabel,
  sourceLabel,
  publishedAt,
  breadcrumb,
  shareHref,
  latestItems,
  popularItems,
  relatedItems,
}: NewsArticleDetailProps) {
  const [copied, setCopied] = useState(false);
  const formattedHtml = useMemo(() => formatArticleHtml(html), [html]);
  const siteOrigin = useMemo(() => getSiteOrigin(), []);

  const shareUrl = siteOrigin ? `${siteOrigin}${shareHref}` : shareHref;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const waUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const xUrl = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      return;
    } catch {
      // ignore, fallback below
    }

    try {
      const input = document.createElement("input");
      input.value = shareUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
    } catch {
      // noop
    }
  };

  const dateLabel = formatArticleDateTime(publishedAt, locale);
  const resolvedBadge = badgeLabel?.trim();
  const resolvedAuthor = authorLabel?.trim();
  const resolvedSource = sourceLabel?.trim();
  const resolvedImage = resolvePortalNewsImageSrc(imageUrl ?? null);
  const hasAside = Boolean(
    latestItems?.length || popularItems?.length || relatedItems?.length,
  );

  return (
    <div
      className={
        hasAside ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" : "block"
      }
    >
      <Card className="min-w-0 rounded-2xl bg-white shadow-sm">
        <div className="p-5 sm:p-7">
          <nav className="text-[11px] font-semibold text-slate-500 line-clamp-2">
            {breadcrumb.map((item, index) => {
              const content = item.href ? (
                <Link href={item.href} className="hover:text-blue-700">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-medium">{item.label}</span>
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

          <header className="mt-4 text-center">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-blue-800">
              {title}
            </h1>

            <div className="mt-3 flex flex-col items-center justify-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                {resolvedAuthor ? (
                  <span className="text-sm items-center font-medium gap-2">
                    {resolvedAuthor}
                  </span>
                ) : null}

                <span className="text-gray-300">-</span>

                {resolvedSource ? (
                  <span
                    className={`text-sm items-center ${resolvedSource == "Newsmaker" || resolvedSource == "Newsmaker.id" ? "text-blue-700" : "text-red-500"} font-medium gap-2`}
                  >
                    {resolvedSource}
                  </span>
                ) : null}
              </div>
              {dateLabel ? (
                <span className="text-xs items-center text-zinc-400 gap-2">
                  {dateLabel}
                </span>
              ) : null}

              <hr className="mt-3 w-30 border-zinc-200" />
            </div>
          </header>

          <div className="mt-6 overflow-hidden bg-white">
            <div className="relative aspect-video bg-slate-100 rounded-lg border border-neutral-200 shadow-md overflow-hidden">
              {resolvedImage ? (
                <div>
                  <Image
                    src={resolvedImage}
                    alt={title}
                    fill
                    sizes="(max-width: 1080px) 100vw, 900px"
                    className="h-full w-full object-cover rounded-lg"
                    quality={100}
                    priority
                    unoptimized
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.src !== PLACEHOLDER_IMAGE_URL) {
                        target.src = PLACEHOLDER_IMAGE_URL;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-linear-to-br from-blue-100 to-slate-200 flex items-center justify-center">
                  <i
                    className="fa-solid fa-newspaper text-slate-300 text-4xl"
                    aria-hidden="true"
                  />
                </div>
              )}

              {resolvedBadge ? (
                <div className="absolute top-3 left-4">
                  <p className="inline-flex items-center rounded-full bg-blue-700/40 px-3 py-1 text-[11px] font-bold uppercase text-white backdrop-blur group-hover:bg-blue-700 transition">
                    {resolvedBadge}
                  </p>
                </div>
              ) : null}
            </div>

            {resolvedSource ? (
              <div className="mt-2">
                <p className="text-[11px] font-medium text-slate-400">
                  {locale === "en" ? "Source:" : "Sumber:"} {resolvedSource}
                </p>
              </div>
            ) : null}

            <div className="mt-5">
              {formattedHtml ? (
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: formattedHtml }}
                />
              ) : (
                <p className="text-sm font-semibold text-slate-600">
                  {locale === "en"
                    ? "Content is not available."
                    : "Konten belum tersedia."}
                </p>
              )}

              <div className="mt-10 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-center gap-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {locale === "en" ? "Share" : "Bagikan"}
                </div>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <a
                    href={fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share to Facebook"
                    className="text-slate-400 hover:text-blue-700 transition text-lg"
                  >
                    <i className="fa-brands fa-facebook" aria-hidden="true" />
                  </a>
                  <a
                    href={xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share to X"
                    className="text-slate-400 hover:text-slate-900 transition text-lg"
                  >
                    <i className="fa-brands fa-x-twitter" aria-hidden="true" />
                  </a>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share to WhatsApp"
                    className="text-slate-400 hover:text-green-600 transition text-lg"
                  >
                    <i className="fa-brands fa-whatsapp" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={copyLink}
                    title="Copy link"
                    className={`text-lg transition ${
                      copied
                        ? "text-blue-700"
                        : "text-slate-400 hover:text-blue-700"
                    }`}
                    aria-label="Copy link"
                  >
                    <i
                      className={`fa-solid ${copied ? "fa-check" : "fa-link"}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                {copied ? (
                  <p className="mt-3 text-center text-[11px] font-semibold text-blue-700">
                    {locale === "en" ? "Copied!" : "Tersalin!"}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {hasAside ? (
        <aside className="space-y-4">
          {latestItems?.length ? (
            <Card>
              <SectionHeader
                title={locale === "en" ? "Latest News" : "Latest News"}
              />
              <div className="p-4 space-y-4">
                {latestItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="flex gap-3 group hover:bg-slate-50 rounded-lg p-2 -mx-2 transition"
                  >
                    <div className="w-16 h-14 shrink-0 rounded-md overflow-hidden bg-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <i
                            className="fa-solid fa-newspaper text-slate-400 text-xs"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">
                        {item.tag}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2 group-hover:text-blue-700 transition">
                        {item.title}
                      </p>
                      {item.date ? (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {item.date}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          {popularItems?.length ? (
            <Card>
              <SectionHeader
                title={locale === "en" ? "Popular News" : "Berita Populer"}
              />
              <div className="p-4 space-y-4">
                {popularItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="flex gap-3 group hover:bg-slate-50 rounded-lg p-2 -mx-2 transition"
                  >
                    <div className="w-16 h-14 shrink-0 rounded-md overflow-hidden bg-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <i
                            className="fa-solid fa-newspaper text-slate-400 text-xs"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">
                        {item.tag}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2 group-hover:text-blue-700 transition">
                        {item.title}
                      </p>
                      {item.date ? (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {item.date}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          {relatedItems?.length ? (
            <Card>
              <SectionHeader
                title={locale === "en" ? "Related News" : "Berita Terkait"}
              />
              <div className="p-4 space-y-4">
                {relatedItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="flex gap-3 group hover:bg-slate-50 rounded-lg p-2 -mx-2 transition"
                  >
                    <div className="w-16 h-14 shrink-0 rounded-md overflow-hidden bg-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <i
                            className="fa-solid fa-newspaper text-slate-400 text-xs"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">
                        {item.tag}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2 group-hover:text-blue-700 transition">
                        {item.title}
                      </p>
                      {item.date ? (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {item.date}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
