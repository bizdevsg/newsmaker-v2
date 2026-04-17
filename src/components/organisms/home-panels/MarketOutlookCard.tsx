import React from "react";
import type { Locale } from "@/locales";
import { Card } from "../../atoms/Card";
import { SectionHeader } from "../../molecules/SectionHeader";
import { PanelArticleCard } from "./PanelArticleCard";
import type { PortalNewsItem } from "@/lib/portalnews";
import {
  buildPortalNewsImageUrl,
  fetchPortalNewsList,
  sortPortalNewsItemsByDate,
} from "@/lib/portalnews";
import { resolvePortalNewsImageSrc } from "@/lib/portalnews-image-proxy";
import { buildAnalysisDetailHref, inferAnalysisCategoryFromItem } from "@/lib/news-routing";

type MarketOutlookItem = {
  key: string;
  eyebrow?: string;
  title: string;
  date: string;
  image: string;
  href: string;
};

type MarketOutlookCardProps = {
  locale: Locale;
  title?: string;
  readMoreLabel: string;
  items?: MarketOutlookItem[];
};

const DEFAULT_ITEMS = (locale: Locale): MarketOutlookItem[] => [
  {
    key: "mo-1",
    eyebrow: "MARKET ANALYSIS",
    title:
      'Trump Signals Peace, Gold "Breathes Again" Amid Interest Rate Repricing',
    date: locale === "en" ? "11 March 2026 | 09:50" : "11 Maret 2026 | 09:50",
    image: "/assets/Screenshot-2024-10-29-at-11.27.48.png",
    href: `/${locale}/analysis/market-analysis`,
  },
  {
    key: "mo-2",
    eyebrow: "MARKET ANALYSIS",
    title: "Gold Tries To Recover, But Dollar Remains Dominant",
    date: locale === "en" ? "11 March 2026 | 09:50" : "11 Maret 2026 | 09:50",
    image: "/assets/Screenshot-2024-10-29-at-11.27.48.png",
    href: `/${locale}/analysis/market-analysis`,
  },
];

const formatDateTimeShort = (value: string | undefined, locale: Locale) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const dateLocale = locale === "en" ? "en-US" : "id-ID";
  const date = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
  const time = new Intl.DateTimeFormat(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);

  return `${date} - ${time}`;
};

const normalizeAssetUrl = (value: string) => value.replace(/ /g, "%20");

const resolveTitle = (article: PortalNewsItem, locale: Locale) => {
  if (locale === "en") {
    return (
      article.title_en?.trim() ||
      article.titles?.en?.trim() ||
      article.title?.trim() ||
      article.title_id?.trim() ||
      article.titles?.id?.trim() ||
      article.titles?.default?.trim() ||
      "Market Analysis"
    );
  }

  return (
    article.title_id?.trim() ||
    article.titles?.id?.trim() ||
    article.title?.trim() ||
    article.title_en?.trim() ||
    article.titles?.en?.trim() ||
    article.titles?.default?.trim() ||
    "Analisis Pasar"
  );
};

const resolveImage = (article: PortalNewsItem) => {
  const raw =
    buildPortalNewsImageUrl(
      article.image_url || article.image || article.images?.[0],
    ) ?? null;
  const resolved = resolvePortalNewsImageSrc(raw);
  return resolved ? normalizeAssetUrl(resolved) : "";
};

async function getMarketAnalysisItems(
  locale: Locale,
): Promise<MarketOutlookItem[] | null> {
  try {
    const { items } = await fetchPortalNewsList();
    const sorted = sortPortalNewsItemsByDate(items as PortalNewsItem[]);

    const matched = sorted.filter(
      (item) => inferAnalysisCategoryFromItem(item) === "market-analysis",
    );
    if (!matched.length) return null;

    return matched.slice(0, 2).map((article, index) => {
      const slug = article.slug?.trim() || "";
      return {
        key: String(article.id ?? slug ?? `analysis-${index}`),
        eyebrow: "MARKET ANALYSIS",
        title: resolveTitle(article, locale),
        date: formatDateTimeShort(
          article.updated_at ?? article.created_at,
          locale,
        ),
        image: resolveImage(article),
        href: slug
          ? buildAnalysisDetailHref(locale, "market-analysis", slug)
          : `/${locale}/analysis/market-analysis`,
      };
    });
  } catch {
    return null;
  }
}

export async function MarketOutlookCard({
  locale,
  title = "Market Outlook",
  readMoreLabel,
  items,
}: MarketOutlookCardProps) {
  const apiItems = !items?.length ? await getMarketAnalysisItems(locale) : null;
  const resolvedItems = (
    items?.length ? items : (apiItems ?? DEFAULT_ITEMS(locale))
  ).slice(0, 2);

  return (
    <Card>
      <SectionHeader title={title} />
      <div className="grid gap-3 p-4">
        {resolvedItems.map((item) => (
          <PanelArticleCard
            key={item.key}
            eyebrow={item.eyebrow}
            title={item.title}
            date={item.date}
            image={item.image}
            ctaLabel={readMoreLabel}
            href={item.href}
          />
        ))}
      </div>
    </Card>
  );
}
