import React from "react";
import Link from "next/link";
import type { Messages } from "@/locales";
import { SectionHeader } from "../molecules/SectionHeader";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";
import {
  buildPortalNewsImageUrl,
  getPortalNewsCategoryKeys,
  getPortalNewsCategorySlug,
  fetchPortalNewsList,
  getPortalNewsMainCategorySlug,
  normalizePortalNewsCategory,
} from "@/lib/portalnews";

type RecentAnalysisProps = {
  messages: Messages;
  locale: string;
  limit?: number;
  detailBasePath?: string;
  includeCategoryName?: string | null;
  includeMainCategorySlug?: string | null;
  excludeCategoryNames?: string[];
  link?: string;
  linkLabel?: string;
};

type RecentAnalysisItem = {
  key?: string;
  title: string;
  summary: string;
  image: string;
  href?: string;
  date: string;
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toSummary = (value?: string, messages?: Messages) => {
  const fallback =
    messages?.widgets?.recentAnalysis?.fallbackSummary ||
    "Latest market analysis summary.";
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

const expandCategoryAliases = (values: string[]) => {
  const normalized = new Set<string>();

  values.forEach((value) => {
    const key = normalizePortalNewsCategory(value);
    if (!key) return;

    normalized.add(key);

    if (
      key === "analisis market" ||
      key === "market analysis" ||
      key === "analysis market indonesia" ||
      key === "analisis market indonesia"
    ) {
      normalized.add("analysis market indonesia");
      normalized.add("analisis market indonesia");
      normalized.add("market analysis");
      normalized.add("analisis market");
    }
  });

  return normalized;
};

async function fetchRecentAnalysis(
  locale: string,
  limit: number,
  detailBasePath: string | undefined,
  includeCategoryName: string | null,
  includeMainCategorySlug: string | null,
  excludeCategoryNames: string[],
  messages?: Messages,
): Promise<RecentAnalysisItem[]> {
  try {
    const { items } = await fetchPortalNewsList();
    const includeSet =
      includeCategoryName === null
        ? null
        : expandCategoryAliases([includeCategoryName ?? "Analisis Market"]);
    const mainCategoryKey = normalizePortalNewsCategory(
      includeMainCategorySlug,
    );
    const excludeSet = expandCategoryAliases(excludeCategoryNames);

    const analysis = items.filter((item) => {
      const categoryKeys = getPortalNewsCategoryKeys(item);
      const mainCategorySlug = normalizePortalNewsCategory(
        getPortalNewsMainCategorySlug(item),
      );

      if (mainCategoryKey && mainCategorySlug !== mainCategoryKey) {
        return false;
      }

      if (includeSet) {
        if (!categoryKeys.some((key) => includeSet.has(key))) {
          return false;
        }
      }

      if (excludeSet.size > 0) {
        return !categoryKeys.some((key) => excludeSet.has(key));
      }

      return true;
    });

    if (!analysis.length) return [];

    const sorted = [...analysis].sort((a, b) => {
      const aTime = Date.parse(a.updated_at || a.created_at || "") || 0;
      const bTime = Date.parse(b.updated_at || b.created_at || "") || 0;
      return bTime - aTime;
    });

    const mappedItems = sorted.slice(0, limit).map((item, idx) => {
      const title = resolvePortalNewsTitle(item, locale, "Analisis Market");
      const image =
        buildPortalNewsImageUrl(item.images?.[0]) ??
        "/assets/Screenshot-2024-10-29-at-11.27.48.png";
      const categorySlug = getPortalNewsCategorySlug(item, "analisis-market");
      const articleSlug = item.slug?.trim() || "";
      const href = articleSlug
        ? detailBasePath
          ? `/${locale}/${detailBasePath.replace(/^\/+/, "").replace(/\/+$/, "")}/${articleSlug}`
          : `/${locale}/news/${categorySlug}/${articleSlug}`
        : "#";
      const date = formatDate(item.updated_at || item.created_at, locale);
      return {
        key: `${item.id ?? idx}-analysis`,
        title,
        summary: toSummary(resolvePortalNewsContent(item, locale), messages),
        image,
        href,
        date,
      };
    });

    return limit <= 0 ? [] : mappedItems.slice(0, limit);
  } catch {
    return [];
  }
}

export async function RecentAnalysis({
  messages,
  locale,
  limit = 4,
  detailBasePath,
  includeCategoryName = "Analisis Market",
  includeMainCategorySlug = null,
  excludeCategoryNames = [],
  link,
  linkLabel,
}: RecentAnalysisProps) {
  const items = await fetchRecentAnalysis(
    locale,
    limit,
    detailBasePath,
    includeCategoryName,
    includeMainCategorySlug,
    excludeCategoryNames,
    messages,
  );

  return (
    <section className="bg-white rounded-lg shadow">
      <SectionHeader
        title={messages?.widgets?.recentAnalysis?.title || "Recent Analysis"}
        link={link}
        linkLabel={linkLabel}
      />
      {items.length > 0 ? (
        <div
          className={`grid items-stretch gap-4 px-4 pb-6 pt-4 sm:grid-cols-1 lg:grid-cols-2`}
        >
          {items.map((item) => (
            <article
              key={item.key ?? item.title}
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
                {item.href ? (
                  <Link
                    href={item.href}
                    className="mt-auto pt-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    {messages?.widgets?.recentAnalysis?.itemCta ||
                      "Read More >"}
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="px-4 pb-6 pt-4">
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
            {locale === "en"
              ? "No analysis is available yet."
              : "Belum ada analisis yang tersedia."}
          </div>
        </div>
      )}
    </section>
  );
}
