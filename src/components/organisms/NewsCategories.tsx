"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { Messages } from "@/locales";
import { useLoading } from "../providers/LoadingProvider";

type NewsCategoriesProps = {
  locale: string;
  messages: Messages;
};

interface CategoryDef {
  id: number; // matches API category_id (0 = no thumbnail lookup)
  name: string;
  slug: string; // used for market news: /news/[slug]
  href?: string; // optional explicit relative path (after locale), e.g. 'economic-news/economy'
  icon: string;
  gradient: string;
  badge: string; // subcategory badge label
}

const MARKET_NEWS_CATEGORIES: CategoryDef[] = [
  // Commodities
  {
    id: 1,
    name: "Gold",
    slug: "gold",
    icon: "fa-solid fa-coins",
    gradient: "from-yellow-400 to-amber-500",
    badge: "COMMODITY",
  },
  {
    id: 6,
    name: "Oil",
    slug: "oil",
    icon: "fa-solid fa-droplet",
    gradient: "from-slate-700 to-slate-900",
    badge: "COMMODITY",
  },
  // Indices
  {
    id: 2,
    name: "Nikkei",
    slug: "nikkei",
    icon: "fa-solid fa-chart-bar",
    gradient: "from-red-500 to-rose-700",
    badge: "INDEX",
  },
  {
    id: 10,
    name: "Hang Seng",
    slug: "hang-seng",
    icon: "fa-solid fa-chart-bar",
    gradient: "from-red-700 to-red-900",
    badge: "INDEX",
  },
  // Crypto
  {
    id: 0,
    name: "Crypto",
    slug: "crypto",
    icon: "fa-brands fa-bitcoin",
    gradient: "from-orange-400 to-orange-600",
    badge: "CRYPTO",
  },
  // Currencies
  {
    id: 9,
    name: "AUD/USD",
    slug: "audusd",
    icon: "fa-solid fa-dollar-sign",
    gradient: "from-green-500 to-emerald-700",
    badge: "CURRENCIES",
  },
  {
    id: 10,
    name: "EUR/USD",
    slug: "eurusd",
    icon: "fa-solid fa-euro-sign",
    gradient: "from-blue-500 to-blue-700",
    badge: "CURRENCIES",
  },
  {
    id: 11,
    name: "GBP/USD",
    slug: "gbpusd",
    icon: "fa-solid fa-sterling-sign",
    gradient: "from-violet-500 to-purple-700",
    badge: "CURRENCIES",
  },
  {
    id: 12,
    name: "USD/JPY",
    slug: "usdjpy",
    icon: "fa-solid fa-yen-sign",
    gradient: "from-blue-600 to-indigo-700",
    badge: "CURRENCIES",
  },
  {
    id: 13,
    name: "USD/CHF",
    slug: "usdchf",
    icon: "fa-solid fa-franc-sign",
    gradient: "from-red-500 to-red-700",
    badge: "CURRENCIES",
  },
  {
    id: 14,
    name: "US Dollar",
    slug: "us-dollar",
    icon: "fa-solid fa-dollar-sign",
    gradient: "from-green-600 to-green-800",
    badge: "CURRENCIES",
  },
];

const ECONOMIC_NEWS_CATEGORIES: CategoryDef[] = [
  {
    id: 0,
    name: "Global & Economy",
    slug: "economy",
    href: "economic-news/economy",
    icon: "fa-solid fa-globe",
    gradient: "from-teal-500 to-cyan-700",
    badge: "ECONOMIC",
  },
  {
    id: 0,
    name: "Fiscal & Monetary",
    slug: "fiscal-moneter",
    href: "economic-news/fiscal-moneter",
    icon: "fa-solid fa-landmark",
    gradient: "from-indigo-500 to-indigo-700",
    badge: "ECONOMIC",
  },
  {
    id: 15,
    name: "Market Update",
    slug: "market-update",
    icon: "fa-solid fa-arrow-trend-up",
    gradient: "from-emerald-500 to-teal-600",
    badge: "ECONOMIC",
  },
];

const LOCAL_THUMBS_BY_SLUG: Record<string, string> = {
  crypto:
    "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp",
  economy: "/assets/tourism-guangzhou-rivers-city-river.jpg",
  "fiscal-moneter":
    "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp",
};

const THUMB_SLUG_ALIASES: Record<string, string[]> = {
  economy: ["global-economics", "global-economy", "global-economics-news"],
  "fiscal-moneter": ["fiscal-monetary", "fiscal-monetary-policy"],
};

// ─── Card component ──────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  locale,
  thumbUrl,
}: {
  cat: CategoryDef;
  locale: string;
  thumbUrl?: string;
}) {
  const resolvedHref = cat.href
    ? `/${locale}/${cat.href}`
    : `/${locale}/news/${cat.slug}`;

  return (
    <Link
      href={resolvedHref}
      className="group relative block h-44 overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-transparent transition-all duration-300 cursor-pointer"
    >
      {/* Background: photo or gradient */}
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={cat.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}

      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${cat.gradient} ${thumbUrl ? "opacity-65 group-hover:opacity-75" : "opacity-100"} transition-opacity duration-300`}
      />

      {/* Badge top-right */}
      <div className="absolute top-3 right-3 z-10">
        <span className="rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
          {cat.badge}
        </span>
      </div>

      {/* Icon top-left */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <i className={`${cat.icon} text-white text-base`}></i>
        </div>
      </div>

      {/* Category name bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <h3 className="text-base font-bold text-white drop-shadow-md leading-tight group-hover:drop-shadow-lg transition-all">
          {cat.name}
        </h3>
      </div>
    </Link>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export function NewsCategories({ locale, messages }: NewsCategoriesProps) {
  const loading = useLoading();
  const [thumbById, setThumbById] = useState<Record<number, string>>({});
  const [thumbBySlug, setThumbBySlug] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch thumbnails from our cached API route (fast & only once)
    const token = loading.start("news-categories");
    fetch("/api/news-thumbnails")
      .then((r) => r.json())
      .then((json) => {
        if (json.status === "success") {
          setThumbById(json.data?.byId ?? {});
          setThumbBySlug(json.data?.bySlug ?? {});
        }
      })
      .catch(() => {
        /* silently fail - cards still show gradient */
      })
      .finally(() => loading.stop(token));
  }, []);

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-10">
      {/* ── Market News ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-5 w-1.5 rounded-full bg-blue-600"></div>
            <h2 className="text-xl font-bold text-slate-800">Market News</h2>
          </div>
          <Link
            href={`/${locale}/news`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            View All &rsaquo;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {MARKET_NEWS_CATEGORIES.map((cat) =>
            (() => {
              const aliases = THUMB_SLUG_ALIASES[cat.slug] ?? [];
              const slugThumb =
                thumbBySlug[cat.slug] ??
                aliases.map((key) => thumbBySlug[key]).find(Boolean);
              const thumbUrl =
                thumbById[cat.id] ??
                slugThumb ??
                LOCAL_THUMBS_BY_SLUG[cat.slug];
              return (
                <CategoryCard
                  key={cat.slug}
                  cat={cat}
                  locale={locale}
                  thumbUrl={thumbUrl}
                />
              );
            })(),
          )}
        </div>
      </div>

      {/* ── Economic News ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-5 w-1.5 rounded-full bg-teal-600"></div>
            <h2 className="text-xl font-bold text-slate-800">Economic News</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {ECONOMIC_NEWS_CATEGORIES.map((cat) =>
            (() => {
              const aliases = THUMB_SLUG_ALIASES[cat.slug] ?? [];
              const slugThumb =
                thumbBySlug[cat.slug] ??
                aliases.map((key) => thumbBySlug[key]).find(Boolean);
              const thumbUrl =
                thumbById[cat.id] ??
                slugThumb ??
                LOCAL_THUMBS_BY_SLUG[cat.slug];
              return (
                <CategoryCard
                  key={cat.slug}
                  cat={cat}
                  locale={locale}
                  thumbUrl={thumbUrl}
                />
              );
            })(),
          )}
        </div>
      </div>
    </section>
  );
}
