import React from "react";
import Link from "next/link";
import type { Locale } from "@/locales";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { PanelArticleCard } from "@/components/organisms/home-panels/PanelArticleCard";
import type { PortalNewsItem } from "@/lib/portalnews";
import {
  buildPortalNewsImageUrl,
  fetchPasarIndonesiaAnalysis,
  fetchPortalNewsList,
  fetchPortalNewsListByCategory,
  sortPortalNewsItemsByDate,
} from "@/lib/portalnews";
import { resolvePortalNewsImageSrc } from "@/lib/portalnews-image-proxy";
import {
  buildGoldCornerDetailHref,
  buildGoldCornerListHref,
  inferAnalysisCategoryFromItem,
} from "@/lib/news-routing";

type WeeklyMarketBriefCardProps = {
  locale: Locale;
  readMoreLabel: string;
};

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
      "Gold Corner"
    );
  }

  return (
    article.title_id?.trim() ||
    article.titles?.id?.trim() ||
    article.title?.trim() ||
    article.title_en?.trim() ||
    article.titles?.en?.trim() ||
    article.titles?.default?.trim() ||
    "Gold Corner"
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

type WeeklyBriefItem = {
  key: string;
  eyebrow?: string;
  title: string;
  date: string;
  image: string;
  href: string;
};

const DEFAULT_ITEM = (locale: Locale): WeeklyBriefItem => ({
  key: "weekly-brief-fallback",
  eyebrow: "GOLD CORNER",
  title:
    locale === "en"
      ? "Gold Corner weekly brief is coming soon."
      : "Gold Corner weekly brief akan segera hadir.",
  date: "",
  image: "/assets/Screenshot-2024-10-29-at-11.27.48.png",
  href: buildGoldCornerListHref(locale),
});

async function getGoldCornerBrief(
  locale: Locale,
): Promise<WeeklyBriefItem | null> {
  const candidates: PortalNewsItem[] = [];

  try {
    const categoryResult = await fetchPortalNewsListByCategory("gold-corner");
    if (categoryResult.ok && categoryResult.items.length) {
      candidates.push(...(categoryResult.items as PortalNewsItem[]));
    }
  } catch {
    // ignore
  }

  try {
    const { items } = await fetchPortalNewsList();
    candidates.push(...(items as PortalNewsItem[]));
  } catch {
    // ignore
  }

  try {
    const { items } = await fetchPasarIndonesiaAnalysis();
    candidates.push(...(items as PortalNewsItem[]));
  } catch {
    // ignore
  }

  const uniqueCandidates: PortalNewsItem[] = [];
  const seenKeys = new Set<string>();
  for (const item of candidates) {
    const key = String(item.id ?? item.slug ?? "").trim();
    if (key) {
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
    }
    uniqueCandidates.push(item);
  }

  const sorted = sortPortalNewsItemsByDate(uniqueCandidates);
  const matched = sorted.filter(
    (item) => inferAnalysisCategoryFromItem(item) === "gold-corner",
  );
  if (!matched.length) return null;

  const article = matched[0];
  const slug = article.slug?.trim() || "";
  const href = slug
    ? buildGoldCornerDetailHref(locale, slug)
    : buildGoldCornerListHref(locale);

  return {
    key: String(article.id ?? slug ?? "gold-corner"),
    eyebrow: "GOLD CORNER",
    title: resolveTitle(article, locale),
    date: formatDateTimeShort(article.updated_at ?? article.created_at, locale),
    image:
      resolveImage(article) || "/assets/Screenshot-2024-10-29-at-11.27.48.png",
    href,
  };
}

export async function WeeklyMarketBriefCard({
  locale,
  readMoreLabel,
}: WeeklyMarketBriefCardProps) {
  const apiItem = await getGoldCornerBrief(locale);
  const item = apiItem ?? DEFAULT_ITEM(locale);
  const listHref = buildGoldCornerListHref(locale);
  const image = "/assets/PILIHAN3.jpeg";

  return (
    <Card>
      <SectionHeader
        title="Weekly Market Brief"
        actions={
          <Link
            href={listHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
          >
            {readMoreLabel}
            <i
              className="fa-solid fa-chevron-right text-[10px]"
              aria-hidden="true"
            />
          </Link>
        }
      />
      <div className="grid gap-3 p-4">
        <PanelArticleCard
          key={item.key}
          eyebrow={item.eyebrow}
          title={item.title}
          date={item.date}
          image={image}
          ctaLabel={readMoreLabel}
          href={item.href}
        />
      </div>
    </Card>
  );
}
