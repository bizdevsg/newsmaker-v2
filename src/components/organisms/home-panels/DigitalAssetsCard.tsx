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
import {
  buildMarketNewsDetailHrefForItem,
  inferMarketNewsCategoryFromItem,
} from "@/lib/news-routing";

type DigitalAssetsItem = {
  key: string;
  eyebrow?: string;
  title: string;
  date: string;
  image: string;
  href: string;
};

type DigitalAssetsCardProps = {
  locale: Locale;
  title?: string;
  readMoreLabel: string;
  heroImage?: string;
  items?: DigitalAssetsItem[];
};

const DEFAULT_ITEMS = (locale: Locale): DigitalAssetsItem[] => [
  {
    key: "da-1",
    eyebrow: "CRYPTO",
    title: "Oil Prices Above. Will They Sustain Or Correct?",
    date: locale === "en" ? "21 March 2026 | 10:50" : "21 Maret 2026 | 10:50",
    image: "/assets/tourism-guangzhou-rivers-city-river-cp.jpg",
    href: `/${locale}/news/crypto`,
  },
  {
    key: "da-2",
    eyebrow: "CRYPTO",
    title: "Rupiah Stable, What Are The Implications Of BI Policy?",
    date: locale === "en" ? "21 March 2026 | 10:50" : "21 Maret 2026 | 10:50",
    image: "/assets/bg-bias23.png",
    href: `/${locale}/news/crypto`,
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

const resolveTitle = (article: PortalNewsItem, locale: Locale) => {
  if (locale === "en") {
    return (
      article.title_en?.trim() ||
      article.titles?.en?.trim() ||
      article.title?.trim() ||
      article.title_id?.trim() ||
      article.titles?.id?.trim() ||
      article.titles?.default?.trim() ||
      "Crypto"
    );
  }

  return (
    article.title_id?.trim() ||
    article.titles?.id?.trim() ||
    article.title?.trim() ||
    article.title_en?.trim() ||
    article.titles?.en?.trim() ||
    article.titles?.default?.trim() ||
    "Crypto"
  );
};

const normalizeAssetUrl = (value: string) => value.replace(/ /g, "%20");

const resolveImage = (article: PortalNewsItem) => {
  const raw =
    buildPortalNewsImageUrl(
      article.image_url || article.image || article.images?.[0],
    ) ?? null;
  const resolved = resolvePortalNewsImageSrc(raw);
  return resolved ? normalizeAssetUrl(resolved) : "";
};

async function getCryptoItems(
  locale: Locale,
): Promise<DigitalAssetsItem[] | null> {
  try {
    const { items } = await fetchPortalNewsList();
    const sorted = sortPortalNewsItemsByDate(items as PortalNewsItem[]);

    const cryptoOnly = sorted.filter(
      (item) => inferMarketNewsCategoryFromItem(item) === "crypto",
    );
    if (!cryptoOnly.length) return null;

    return cryptoOnly.slice(0, 2).map((article, index) => ({
      key: String(article.id ?? article.slug ?? `crypto-${index}`),
      eyebrow: "CRYPTO",
      title: resolveTitle(article, locale),
      date: formatDateTimeShort(
        article.updated_at ?? article.created_at,
        locale,
      ),
      image: resolveImage(article),
      href:
        buildMarketNewsDetailHrefForItem(locale, article) ??
        `/${locale}/news/crypto`,
    }));
  } catch {
    return null;
  }
}

export async function DigitalAssetsCard({
  locale,
  title = "Digital Assets",
  readMoreLabel,
  heroImage = "/assets/goldIMG.png",
  items,
}: DigitalAssetsCardProps) {
  const apiItems = !items?.length ? await getCryptoItems(locale) : null;
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
