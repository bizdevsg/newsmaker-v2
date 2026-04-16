"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { NewsCardItem } from "@/lib/news-cards";

type NewsListProps = {
  items: NewsCardItem[];
  readMoreLabel?: string;
};

const PLACEHOLDER_IMAGE_URL =
  "https://archive.org/download/placeholder-image/placeholder-image.jpg";

const getSiteOrigin = () => {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

export function NewsList({ items, readMoreLabel }: NewsListProps) {
  const ctaLabel = (readMoreLabel ?? "Read More").toUpperCase();
  const siteOrigin = useMemo(() => getSiteOrigin(), []);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedKey) return;
    const id = window.setTimeout(() => setCopiedKey(null), 1600);
    return () => window.clearTimeout(id);
  }, [copiedKey]);

  const copyLink = async (href: string, key: string) => {
    const fullUrl = siteOrigin ? `${siteOrigin}${href}` : href;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedKey(key);
      return;
    } catch {
      // ignore, fallback below
    }

    try {
      const input = document.createElement("input");
      input.value = fullUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedKey(key);
    } catch {
      // noop
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => {
        const title = item.title?.trim() || "News";
        const key = item.key ?? String(item.key ?? idx);
        const articleUrl = siteOrigin ? `${siteOrigin}${item.href}` : item.href;
        const encodedUrl = encodeURIComponent(articleUrl);
        const encodedTitle = encodeURIComponent(title);
        const waUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        const xUrl = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        const isCopied = copiedKey === key;

        return (
          <div
            key={key}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
          >
            <div className="relative h-48 overflow-hidden bg-slate-100 shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (target.src !== PLACEHOLDER_IMAGE_URL) {
                      target.src = PLACEHOLDER_IMAGE_URL;
                    }
                  }}
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-blue-100 to-slate-200 flex items-center justify-center">
                  <i
                    className="fa-solid fa-newspaper text-slate-300 text-3xl"
                    aria-hidden="true"
                  />
                </div>
              )}

              <div className="absolute top-2 left-3 flex flex-wrap gap-1">
                <div className="bg-blue-700/60 group-hover:bg-blue-700 rounded-full px-2 py-0.5 transition duration-300">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                    {item.tag}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1 p-4">
              <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-3 mb-3 group-hover:text-blue-700 transition">
                {title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">
                {item.summary}
              </p>

              <div className="mt-auto">
                {item.date ? (
                  <p className="text-[10px] text-slate-400 mb-3">{item.date}</p>
                ) : null}

                <Link
                  href={item.href}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
                >
                  {ctaLabel}
                </Link>

                <div className="flex w-fit items-center mx-auto gap-2.5 mt-3">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share to WhatsApp"
                    className="text-slate-400 hover:text-green-500 transition text-md"
                  >
                    <i className="fa-brands fa-whatsapp" aria-hidden="true" />
                  </a>
                  <a
                    href={fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share to Facebook"
                    className="text-slate-400 hover:text-blue-600 transition text-md"
                  >
                    <i className="fa-brands fa-facebook" aria-hidden="true" />
                  </a>
                  <a
                    href={xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share to X"
                    className="text-slate-400 hover:text-slate-800 transition text-md"
                  >
                    <i className="fa-brands fa-x-twitter" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => copyLink(item.href, key)}
                    title="Copy link"
                    className={`text-md cursor-pointer transition ${
                      isCopied
                        ? "text-blue-600"
                        : "text-slate-400 hover:text-blue-500"
                    }`}
                    aria-label="Copy link"
                  >
                    <i
                      className={`fa-solid ${isCopied ? "fa-check" : "fa-link"}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isCopied ? (
                    <span className="text-[10px] text-blue-600 font-semibold animate-in fade-in">
                      Copied!
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
