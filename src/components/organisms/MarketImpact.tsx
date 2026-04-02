"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../atoms/Card";
import { ImpactCard } from "../molecules/ImpactCard";
import type { Messages } from "@/locales";
import { useLoading } from "../providers/LoadingProvider";
import { SectionHeader } from "../molecules/SectionHeader";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";
import {
  INDONESIA_MARKET_NEWS_CATEGORY_SLUG,
  INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH,
} from "@/lib/indonesia-market-sections";

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
    name?: string;
    slug?: string;
  };
};

const NEWS_IMAGE_BASE =
  process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE?.replace(/\/$/, "") ?? "";
const DISPLAY_LIMIT = 2;
const SKIP_LATEST_COUNT = 1;

const formatNewsDate = (value: string | undefined, locale: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
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
  const fullListHref = `/${locale}/indonesia-market/news`;
  const viewAllLabel =
    messages?.equities?.newsCategories?.viewAll ||
    (locale === "en" ? "View All" : "Lihat Semua");

  useEffect(() => {
    const fetchNews = async () => {
      const token = start("market-impact");
      try {
        const res = await fetch(
          `/api/portalnews?category=${INDONESIA_MARKET_NEWS_CATEGORY_SLUG}&limit=${
            DISPLAY_LIMIT + SKIP_LATEST_COUNT
          }`,
          {
            cache: "no-store",
          },
        );
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const message = json?.message
            ? `${json.message}`
            : `API error: ${res.status}`;
          const cause = json?.cause ? ` (${json.cause})` : "";
          throw new Error(`${message}${cause}`);
        }
        if (json && json.data) {
          const nextItems = Array.isArray(json.data)
            ? json.data.slice(
                SKIP_LATEST_COUNT,
                SKIP_LATEST_COUNT + DISPLAY_LIMIT,
              )
            : [];
          setNewsData(nextItems);
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
    const articleSlug = item.slug?.trim();
    const formattedDate = formatNewsDate(
      item.updated_at ?? item.created_at,
      locale,
    );
    const title = resolvePortalNewsTitle(item, locale, "Judul berita");
    const summaryText = stripHtml(resolvePortalNewsContent(item, locale));

    return {
      key: `news-${item.id || index}`,
      title,
      summary: summaryText ? `${summaryText.substring(0, 150)}...` : "-",
      date: formattedDate,
      href: articleSlug
        ? `/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/${articleSlug}`
        : undefined,
      imageLabel: (() => {
        if (item.images && item.images.length > 0) {
          const firstImage = item.images[0];
          if (firstImage.startsWith("http")) {
            return firstImage;
          }
          const base = imageBase || NEWS_IMAGE_BASE;
          const imagePath = firstImage.startsWith("/")
            ? firstImage
            : `/${firstImage}`;
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
        link={fullListHref}
        linkLabel={viewAllLabel}
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
