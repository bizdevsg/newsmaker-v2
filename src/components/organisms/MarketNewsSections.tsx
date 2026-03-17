"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SectionHeader } from "../molecules/SectionHeader";

type NewsItem = {
  id?: number;
  title?: string;
  titles?: { default?: string };
  slug?: string;
  content?: string;
  kategori?: { name?: string; slug?: string };
  images?: string[];
  updated_at?: string;
  created_at?: string;
};

type ApiResponse = {
  status?: string;
  message?: string;
  imageBase?: string;
  data?: NewsItem[];
};

type MarketNewsSectionProps = {
  locale?: string;
  limitPerSection?: number;
};

const DEFAULT_LIMIT = 2;
const FALLBACK_IMAGE = "/assets/Screenshot-2024-10-29-at-11.27.48.png";
const ANALISIS_MARKET_CATEGORY = "analisis-market";

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toSummary = (value?: string) => {
  if (!value) return "Ringkasan berita belum tersedia.";
  const text = stripHtml(value);
  if (!text) return "Ringkasan berita belum tersedia.";
  return text.length > 130 ? `${text.slice(0, 130).trim()}...` : text;
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

const resolveImage = (item: NewsItem, imageBase: string) => {
  const image = item.images?.[0];
  if (!image) return FALLBACK_IMAGE;
  const path = image.startsWith("/") ? image : `/${image}`;
  return imageBase ? `${imageBase}${path}` : path;
};

const toHref = (item: NewsItem, locale: string) => {
  const categorySlug = item.kategori?.slug?.trim() || "market-update";
  const articleSlug = item.slug?.trim() || "";
  return articleSlug
    ? `/${locale}/news/${categorySlug}/${articleSlug}`
    : `/${locale}/news`;
};

const getCategoryLabel = (item: NewsItem, fallbackLabel: string) =>
  item.kategori?.name?.trim() || fallbackLabel;

const buildPortalNewsUrl = (
  limit: number,
  options?: {
    category?: string;
    excludeCategory?: string;
  },
) => {
  const params = new URLSearchParams({
    limit: String(Math.max(1, limit)),
  });

  if (options?.category) {
    params.set("category", options.category);
  }
  if (options?.excludeCategory) {
    params.set("excludeCategory", options.excludeCategory);
  }

  return `/api/portalnews?${params.toString()}`;
};

const useMarketNewsData = (localeProp: string, requestUrl: string) => {
  const { locale: routeLocale } = useParams<{ locale?: string }>();
  const locale = localeProp || routeLocale || "id";
  const [items, setItems] = useState<NewsItem[]>([]);
  const [imageBase, setImageBase] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const res = await fetch(requestUrl, {
          cache: "no-store",
        });
        const json = (await res.json().catch(() => null)) as ApiResponse | null;
        if (!res.ok) {
          const message = json?.message || `API error: ${res.status}`;
          throw new Error(message);
        }
        const data = Array.isArray(json?.data) ? json?.data : [];
        if (!isActive) return;
        setItems(data);
        setImageBase(typeof json?.imageBase === "string" ? json.imageBase : "");
      } catch (err) {
        if (!isActive) return;
        const message =
          err instanceof Error ? err.message : "Failed to load news";
        setErrorMessage(message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [requestUrl]);

  return { locale, items, imageBase, isLoading, errorMessage };
};

const RenderItems = ({
  list,
  locale,
  imageBase,
  isLoading,
  errorMessage,
  fallbackCategoryLabel,
  emptyMessage,
}: {
  list: NewsItem[];
  locale: string;
  imageBase: string;
  isLoading: boolean;
  errorMessage: string | null;
  fallbackCategoryLabel: string;
  emptyMessage: string;
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <article
            key={`market-news-skeleton-${index}`}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:grid sm:grid-cols-[200px_1fr]"
          >
            <div className="h-36 animate-pulse bg-slate-200 sm:h-full" />
            <div className="space-y-3 p-3.5">
              <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3.5 w-11/12 animate-pulse rounded bg-slate-100" />
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />
            </div>
          </article>
        ))}
      </div>
    );
  }
  if (errorMessage) {
    return (
      <div className="text-center text-sm font-semibold text-rose-600 py-6">
        {errorMessage}
      </div>
    );
  }
  if (!list.length) {
    return (
      <div className="text-center text-sm font-semibold text-slate-500 py-6">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((item, index) => {
        const title = item.titles?.default || item.title || "Judul berita";
        const date = formatDate(item.updated_at || item.created_at, locale);
        const summary = toSummary(item.content);
        const categoryLabel = getCategoryLabel(item, fallbackCategoryLabel);
        return (
          <Link
            href={toHref(item, locale)}
            key={`${item.id ?? "news"}-${index}`}
            className="group block h-full"
          >
            <article className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:grid sm:grid-cols-[200px_1fr]">
              <div className="h-36 overflow-hidden bg-slate-100 sm:h-full">
                <img
                  src={resolveImage(item, imageBase)}
                  alt={title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                    {categoryLabel}
                  </span>
                  {date ? (
                    <span className="text-[11px] font-medium text-slate-400">
                      {date}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition group-hover:text-blue-700">
                    {title}
                  </h2>
                  <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                    {summary}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-1 text-xs font-semibold text-blue-700">
                  <span className="transition group-hover:text-blue-800">
                    Baca selengkapnya
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-700 transition group-hover:border-blue-200 group-hover:bg-blue-100"
                  >
                    <i className="fa-solid fa-arrow-right text-xs" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
};

export function MarketOutlookNews({
  locale: propLocale,
  limitPerSection = DEFAULT_LIMIT,
}: MarketNewsSectionProps) {
  const requestUrl = buildPortalNewsUrl(limitPerSection, {
    category: ANALISIS_MARKET_CATEGORY,
  });
  const { locale, items, imageBase, isLoading, errorMessage } =
    useMarketNewsData(propLocale || "", requestUrl);

  return (
    <section className="bg-white rounded-md shadow">
      <SectionHeader
        title="Market Outlook"
        link={`/${locale}/news/analisis-market`}
        linkLabel="Lihat semua"
      />
      <div className="flex flex-col gap-3">
        <div className="p-4">
          <RenderItems
            list={items}
            locale={locale}
            imageBase={imageBase}
            isLoading={isLoading}
            errorMessage={errorMessage}
            fallbackCategoryLabel="Market Outlook"
            emptyMessage="Berita market outlook tidak tersedia"
          />
        </div>
      </div>
    </section>
  );
}

export function MarketHighlightNews({
  locale: propLocale,
  limitPerSection = DEFAULT_LIMIT,
}: MarketNewsSectionProps) {
  const requestUrl = buildPortalNewsUrl(limitPerSection, {
    excludeCategory: ANALISIS_MARKET_CATEGORY,
  });
  const { locale, items, imageBase, isLoading, errorMessage } =
    useMarketNewsData(propLocale || "", requestUrl);

  return (
    <section className="bg-white rounded-md shadow">
      <SectionHeader
        title="Market Highlight"
        link={`/${locale}/news`}
        linkLabel="Lihat semua"
      />
      <div className="flex flex-col gap-3">
        <div className="p-4">
          <RenderItems
            list={items}
            locale={locale}
            imageBase={imageBase}
            isLoading={isLoading}
            errorMessage={errorMessage}
            fallbackCategoryLabel="Market Highlight"
            emptyMessage="Berita market highlight tidak tersedia"
          />
        </div>
      </div>
    </section>
  );
}
