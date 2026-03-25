import React from "react";
import Link from "next/link";
import type { Messages } from "@/locales";
import { SectionHeader } from "../molecules/SectionHeader";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

type RecentAnalysisProps = {
  messages: Messages;
  locale: string;
  limit?: number;
  includeCategoryName?: string | null;
  excludeCategoryNames?: string[];
};

const NEWS_API = process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ?? "";
const NEWS_TOKEN = process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ?? "";
const IMAGE_BASE = process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE ?? "";

type NewsItem = {
  id: number;
  title?: string;
  titles?: { default?: string };
  slug?: string;
  content?: string;
  kategori?: { name?: string; slug?: string };
  images?: string[];
  updated_at?: string;
  created_at?: string;
};

const fallbackItems = [
  {
    title: "Gold Steady Updates",
    summary: "Investors look for direction amid global cues.",
    image: "/assets/Screenshot-2024-10-29-at-11.27.48.png",
    href: "#",
    date: "",
  },
  {
    title: "Oil Rises After OPEC",
    summary: "Tight supply backdrop lifts prices.",
    image: "/assets/tourism-guangzhou-rivers-city-river.jpg",
    href: "#",
    date: "",
  },
  {
    title: "Bitcoin Bounce Back",
    summary: "Crypto regains momentum with risk-on flows.",
    image:
      "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp",
    href: "#",
    date: "",
  },
  {
    title: "US Data Softens",
    summary: "Macro releases nudge rate expectations.",
    image: "/assets/Screenshot-2024-10-29-at-11.27.48.png",
    href: "#",
    date: "",
  },
];

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toSummary = (value?: string, messages?: Messages) => {
  const fallback = messages?.widgets?.recentAnalysis?.fallbackSummary || "Latest market analysis summary.";
  if (!value) return fallback;
  const text = stripHtml(value);
  if (!text) return fallback;
  return text.length > 120 ? `${text.slice(0, 120).trim()}...` : text;
};

const formatDate = (value: string | undefined, locale: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

async function fetchRecentAnalysis(
  locale: string,
  limit: number,
  includeCategoryName: string | null,
  excludeCategoryNames: string[],
  messages?: Messages
) {
  try {
    const response = await fetchWithTimeout(NEWS_API, {
      headers: { Authorization: `Bearer ${NEWS_TOKEN}` },
      cache: "no-store",
    });
    if (!response.ok) return fallbackItems;
    const payload = await response.json();
    if (!Array.isArray(payload?.data)) return fallbackItems;

    const items: NewsItem[] = payload.data;
    const includeName =
      includeCategoryName === null
        ? null
        : (includeCategoryName ?? "Analisis Market").toLowerCase();
    const excludeSet = new Set(
      excludeCategoryNames.map((name) => name.toLowerCase()),
    );

    const analysis = items.filter((item) => {
      const name = item.kategori?.name?.toLowerCase() ?? "";
      if (includeName) return name === includeName;
      if (excludeSet.size > 0) return !excludeSet.has(name);
      return true;
    });

    if (!analysis.length) return fallbackItems;

    const sorted = [...analysis].sort((a, b) => {
      const aTime = Date.parse(a.updated_at || a.created_at || "") || 0;
      const bTime = Date.parse(b.updated_at || b.created_at || "") || 0;
      return bTime - aTime;
    });

    return sorted.slice(0, limit).map((item, idx) => {
      const title = item.titles?.default || item.title || "Analisis Market";
      const image = item.images?.[0]
        ? `${IMAGE_BASE}${item.images[0]}`
        : "/assets/Screenshot-2024-10-29-at-11.27.48.png";
      const categorySlug = item.kategori?.slug?.trim() || "market-update";
      const articleSlug = item.slug?.trim() || "";
      const href = articleSlug
        ? `/${locale}/news/${categorySlug}/${articleSlug}`
        : "#";
      const date = formatDate(item.updated_at || item.created_at, locale);
      return {
        key: `${item.id ?? idx}-analysis`,
        title,
        summary: toSummary(item.content, messages),
        image,
        href,
        date,
      };
    });
  } catch {
    return fallbackItems;
  }
}

export async function RecentAnalysis({
  messages,
  locale,
  limit = 4,
  includeCategoryName = "Analisis Market",
  excludeCategoryNames = [],
}: RecentAnalysisProps) {
  const items = await fetchRecentAnalysis(
    locale,
    limit,
    includeCategoryName,
    excludeCategoryNames,
    messages
  );
  const gridCols =
    items.length <= 1
      ? "sm:grid-cols-1 lg:grid-cols-1"
      : items.length === 2
        ? "sm:grid-cols-2 lg:grid-cols-2"
        : items.length === 3
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="bg-white rounded-lg shadow">
      <SectionHeader title={messages?.widgets?.recentAnalysis?.title || "Recent Analysis"} link={`/${locale}/news/analisis-market`} linkLabel={messages?.widgets?.recentAnalysis?.cta || "Recent >"} />
      <div className={`grid items-stretch gap-4 px-4 pb-6 pt-4 ${gridCols}`}>
        {items.map((item) => (
          <article
            key={item.title}
            className="flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white"
          >
            <div className="aspect-video flex-shrink-0 overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3">
              <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
                {item.title}
              </h4>
              {item.date ? (
                <p className="text-[11px] font-semibold text-slate-400">
                  {item.date}
                </p>
              ) : null}
              <p className="line-clamp-3 flex-1 text-xs text-slate-500">
                {item.summary}
              </p>
              <Link
                href={item.href}
                className="mt-auto pt-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                {messages?.widgets?.recentAnalysis?.itemCta || "Read More >"}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
