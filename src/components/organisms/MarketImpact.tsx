"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../atoms/Card";
import { ImpactCard } from "../molecules/ImpactCard";
import type { Messages } from "@/locales";
import { useLoading } from "../providers/LoadingProvider";
import { SectionHeader } from "../molecules/SectionHeader";
import { INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH } from "@/lib/indonesia-market-sections";
import { resolvePortalNewsImageSrc } from "@/lib/portalnews-image-proxy";
import { resolveIndonesiaMarketNewsCategorySlugFromItem } from "@/lib/indonesia-market-news-category";

type MarketImpactProps = {
  messages: Messages;
  locale?: string;
};

type ApiAuthor = {
  id?: number;
  name?: string;
};

type MarketImpactNewsItem = {
  id?: number;
  slug?: string;

  title_id?: string;
  title_en?: string;

  content_id?: string;
  content_en?: string;

  category?: string;
  category_label?: string;

  image_url?: string;

  author?: ApiAuthor;

  created_at?: string;
  updated_at?: string;
};

const DISPLAY_LIMIT = 2;
const SKIP_LATEST_COUNT = 1;

const formatNewsDate = (value: string | undefined, locale: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function MarketImpact({ messages, locale = "id" }: MarketImpactProps) {
  const { start, stop } = useLoading();

  const [newsData, setNewsData] = useState<MarketImpactNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fullListHref = `/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/all`;

  const viewAllLabel =
    messages?.equities?.newsCategories?.viewAll ||
    (locale === "en" ? "View All" : "Lihat Semua");

  useEffect(() => {
    const fetchNews = async () => {
      const token = start("market-impact");

      try {
        const res = await fetch(
          `/api/portalnews/pasar-indonesia?limit=${
            DISPLAY_LIMIT + SKIP_LATEST_COUNT
          }`,
          {
            cache: "no-store",
          },
        );

        const json = (await res.json().catch(() => null)) as {
          status?: string;
          data?: unknown;
          message?: string;
        } | null;

        if (!res.ok || !json || json.status !== "success") {
          setNewsData([]);
          return;
        }

        const items = Array.isArray(json.data)
          ? (json.data as MarketImpactNewsItem[])
          : [];

        const sliced = items.slice(
          SKIP_LATEST_COUNT,
          SKIP_LATEST_COUNT + DISPLAY_LIMIT,
        );

        setNewsData(sliced);
      } catch {
        setNewsData([]);
      } finally {
        setIsLoading(false);
        stop(token);
      }
    };

    fetchNews();
  }, [start, stop]);

  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return "";

    const tmp = document.createElement("div");
    tmp.innerHTML = html;

    return tmp.textContent || tmp.innerText || "";
  };

  const displayItems = newsData.map((item, index) => {
    const slug = item.slug?.trim();
    const title =
      (locale === "en"
        ? item.title_en || item.title_id
        : item.title_id || item.title_en) || "Untitled news";

    const content =
      locale === "en"
        ? item.content_en || item.content_id
        : item.content_id || item.content_en;

    const summaryText = stripHtml(content || "");

    const formattedDate = formatNewsDate(
      item.updated_at ?? item.created_at,
      locale,
    );

    const imageUrl =
      resolvePortalNewsImageSrc(item.image_url) ||
      "/images/news-placeholder.png";

    const author = item.author;

    return {
      key: `impact-${item.id || index}`,
      title,
      summary:
        summaryText.length > 150
          ? summaryText.slice(0, 150) + "..."
          : summaryText,
      date: formattedDate,
      href: slug
        ? `/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/${resolveIndonesiaMarketNewsCategorySlugFromItem(item)}/${slug}`
        : fullListHref,
      imageLabel: imageUrl,
      author,
    };
  });

  return (
    <Card as="section">
      <SectionHeader
        title={messages.marketImpact.title}
        link={fullListHref}
        linkLabel={viewAllLabel}
      />

      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-sm font-semibold text-slate-500 py-4">
            {locale === "en" ? "Loading news..." : "Memuat berita..."}
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
              ctaLabel={messages.common.readFull}
            />
          ))
        ) : (
          <div className="text-center text-sm font-semibold text-slate-500 py-4">
            {locale === "en" ? "News not available" : "Berita tidak tersedia"}
          </div>
        )}
      </div>
    </Card>
  );
}
