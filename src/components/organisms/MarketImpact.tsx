"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Card } from "../atoms/Card";
import { ImpactCard } from "../molecules/ImpactCard";
import type { Messages } from "@/locales";
import { useLoading } from "../providers/LoadingProvider";
import { SectionHeader } from "../molecules/SectionHeader";

type MarketImpactProps = {
  messages: Messages;
  locale?: string;
};

type MarketImpactNewsItem = {
  id?: number;
  title?: string;
  titles?: {
    default?: string;
  };
  content?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  images?: string[];
  kategori?: {
    slug?: string;
  };
};

const NEWS_IMAGE_BASE = process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE ?? "";

const formatNewsDate = (value: string | undefined) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
};

export function MarketImpact({ messages, locale = "id" }: MarketImpactProps) {
  const { start, stop } = useLoading();
  const [newsData, setNewsData] = useState<MarketImpactNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageBase, setImageBase] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      const token = start("market-impact");
      try {
        const res = await fetch("/api/portalnews?limit=4");
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const message = json?.message
            ? `${json.message}`
            : `API error: ${res.status}`;
          const cause = json?.cause ? ` (${json.cause})` : "";
          throw new Error(`${message}${cause}`);
        }
        if (json && json.data) {
          setNewsData(json.data);
          if (typeof json.imageBase === "string") {
            setImageBase(json.imageBase);
          }
        }
      } catch (err) {
        console.error("Failed to fetch news", err);
      } finally {
        setIsLoading(false);
        stop(token);
      }
    };
    const initialTimer = window.setTimeout(fetchNews, 300);
    return () => window.clearTimeout(initialTimer);
  }, [start, stop]);

  // Helper to strip html tags for summary safely on client side
  const stripHtml = (html: string) => {
    if (typeof document === "undefined") return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const displayItems = newsData.map((item, index) => {
    const formattedDate = formatNewsDate(item.updated_at ?? item.created_at);
    const categorySlug = item.kategori?.slug?.trim() || "market-update";
    const articleSlug = item.slug?.trim() || "";
    const title =
      item.titles?.default?.trim() || item.title?.trim() || "Judul berita";
    const href = articleSlug
      ? `/${locale}/news/${categorySlug}/${articleSlug}`
      : `/${locale}/news`;

    return {
      key: `news-${item.id || index}`,
      title,
      summary: stripHtml(item.content ?? "").substring(0, 150) + "...",
      date: formattedDate,
      href,
      imageLabel: (() => {
        if (item.images && item.images.length > 0) {
          const base = imageBase || NEWS_IMAGE_BASE;
          const imagePath = item.images[0].startsWith("/")
            ? item.images[0]
            : `/${item.images[0]}`;
          return `${base}${imagePath}`;
        }
        return "./assets/Screenshot-2024-10-29-at-11.27.48.png";
      })(),
    };
  });

  return (
    <Card as="section">
      <SectionHeader
        title={messages.marketImpact.title}
        optional={
          <Link
            href={`/${locale}/news`}
            className="text-xs font-semibold text-blue-700 transition hover:text-blue-800"
          >
            {messages.marketImpact.ctaLabel}
          </Link>
        }
      />
      <div className="px-4 py-5 space-y-4">
        {isLoading ? (
          <div className="text-center text-sm font-semibold text-slate-500 py-4">
            Memuat berita...
          </div>
        ) : displayItems.length > 0 ? (
          displayItems.map((impact) => (
            <ImpactCard
              key={impact.key}
              title={impact.title}
              summary={impact.summary}
              date={impact.date}
              href={impact.href}
              imageLabel={impact.imageLabel}
              ctaLabel={messages.common.readFullInsight}
            />
          ))
        ) : (
          <div className="text-center text-sm font-semibold text-slate-500 py-4">
            Berita tidak tersedia
          </div>
        )}
      </div>
    </Card>
  );
}
