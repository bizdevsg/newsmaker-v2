import React from "react";
import Link from "next/link";
import { SectionHeader } from "../molecules/SectionHeader";
import type { Messages } from "@/locales";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

type MarketOutlookSectionProps = {
  locale: string;
  messages?: Messages;
  limit?: number;
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
    key: "overview-uptick",
    title: "Uptick di Metromonia, Pasar Aset Naik?",
    summary: "Aset blue-chip bergerak stabil jelang data inflasi.",
    image: "/assets/tourism-guangzhou-rivers-city-river.jpg",
    href: "#",
    date: "",
  },
  {
    key: "overview-oil-opec",
    title: "Oil Rises After OPEC Signal",
    summary: "Pasar energi respons ketegangan suplai.",
    image:
      "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp",
    href: "#",
    date: "",
  },
  {
    key: "overview-bitcoin-1",
    title: "Bitcoin Bounce Back",
    summary: "Sentimen risk-on mengangkat aset kripto.",
    image: "/assets/Screenshot-2024-10-29-at-11.27.48.png",
    href: "#",
    date: "",
  },
  {
    key: "overview-bitcoin-2",
    title: "Bitcoin Bounce Back",
    summary: "Sentimen risk-on mengangkat aset kripto.",
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
  const fallback = messages?.widgets?.marketOutlook?.fallbackSummary || "Latest market summary.";
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

async function fetchMarketOverview(
  locale: string,
  limit: number,
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

    const excludeSet = new Set(
      excludeCategoryNames.map((name) => name.toLowerCase()),
    );

    const items: NewsItem[] = payload.data;
    const filtered = items.filter((item) => {
      const name = item.kategori?.name?.toLowerCase() ?? "";
      return excludeSet.size > 0 ? !excludeSet.has(name) : true;
    });

    if (!filtered.length) return fallbackItems;

    const sorted = [...filtered].sort((a, b) => {
      const aTime = Date.parse(a.updated_at || a.created_at || "") || 0;
      const bTime = Date.parse(b.updated_at || b.created_at || "") || 0;
      return bTime - aTime;
    });

    return sorted.slice(0, limit).map((item, idx) => {
      const title = item.titles?.default || item.title || (messages?.widgets?.marketOutlook?.title || "Market Overview");
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
        key: `${item.id ?? idx}-overview`,
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

export async function MarketOutlookSection({
  locale,
  messages,
  limit = 4,
  excludeCategoryNames = ["Analisis Market"],
}: MarketOutlookSectionProps) {
  const outlookItems = await fetchMarketOverview(
    locale,
    limit,
    excludeCategoryNames,
    messages
  );
  const gridCols =
    outlookItems.length <= 1
      ? "sm:grid-cols-1 lg:grid-cols-1"
      : outlookItems.length === 2
        ? "sm:grid-cols-2 lg:grid-cols-2"
        : outlookItems.length === 3
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <section className="rounded-lg bg-white shadow overflow-hidden">
      <SectionHeader
        title={messages?.widgets?.marketOutlook?.title || "Market Overview"}
        link={`/${locale}/news`}
        linkLabel={messages?.widgets?.marketOutlook?.cta || "Read More..."}
      />
      <div className={`grid items-stretch gap-4 p-4 ${gridCols}`}>
        {outlookItems.map((item) => (
          <article
            key={item.key}
            className="flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white"
          >
            <div className="aspect-[16/9] flex-shrink-0 overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full max-h-50 object-cover"
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
              <p className="line-clamp-3 flex-1 text-xs text-slate-500">{item.summary}</p>
              <Link
                href={item.href}
                className="mt-auto pt-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                {messages?.widgets?.marketOutlook?.itemCta || "Read More >"}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
