import React from "react";
import type { Locale, Messages } from "@/locales";
import type { StrategicItem } from "@/components/organisms/home-insight-boards/types";
import { fetchLatestTikTok } from "@/components/organisms/home-insight-boards/fetchLatestTikTok";
import { StrategicInsightBoard } from "@/components/organisms/home-insight-boards/StrategicInsightBoard";
import { WeeklyMarketBriefCard } from "@/components/organisms/home-insight-boards/WeeklyMarketBriefCard";
import { VideoBriefingCard } from "@/components/organisms/home-insight-boards/VideoBriefingCard";
import { MarketPulseCard } from "@/components/organisms/home-insight-boards/MarketPulseCard";
import { SocialLinksCard } from "@/components/organisms/home-insight-boards/SocialLinksCard";
import type { PortalNewsItem } from "@/lib/portalnews";
import {
  buildPortalNewsImageUrl,
  fetchPasarIndonesiaAnalysis,
  fetchPortalNewsList,
  sortPortalNewsItemsByDate,
} from "@/lib/portalnews";
import { resolvePortalNewsImageSrc } from "@/lib/portalnews-image-proxy";
import { itemMatchesTerms } from "@/lib/news-filter";
import { ANALYSIS_CONFIG, buildAnalysisDetailHref } from "@/lib/news-routing";

type HomeInsightBoardsProps = {
  locale: Locale;
  messages: Messages;
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
      "Analysis"
    );
  }

  return (
    article.title_id?.trim() ||
    article.titles?.id?.trim() ||
    article.title?.trim() ||
    article.title_en?.trim() ||
    article.titles?.en?.trim() ||
    article.titles?.default?.trim() ||
    "Analisis"
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

const DEFAULT_STRATEGIC_ITEMS = (locale: Locale): StrategicItem[] => {
  const eyebrow = locale === "en" ? "Analysis & Opinion" : "Analisis & Opini";
  const listHref = `/${locale}/analysis/analisis-opinion`;

  return [
    {
      key: "strategic-1",
      eyebrow,
      title:
        locale === "en"
          ? "Energy Crisis Mode On: Oil Soars, Other Commodities Follow"
          : "Energy Crisis Mode On: Oil Soars, Other Commodities Follow",
      date: locale === "en" ? "11 March 2026 | 09:50" : "11 Maret 2026 | 09:50",
      image: "/assets/goldIMG.png",
      href: listHref,
    },
    {
      key: "strategic-2",
      eyebrow: "",
      title:
        locale === "en"
          ? "Gold Tries To Recover, But Dollar Remains Dominant"
          : "Gold Tries To Recover, But Dollar Remains Dominant",
      date: locale === "en" ? "11 March 2026 | 09:50" : "11 Maret 2026 | 09:50",
      image: "/assets/BCOimg.png",
      href: listHref,
    },
  ];
};

async function getStrategicInsightItems(
  locale: Locale,
): Promise<StrategicItem[] | null> {
  const analysisOpinionConfig =
    ANALYSIS_CONFIG.find((config) => config.slug === "analisis-opinion") ??
    null;
  if (!analysisOpinionConfig) return null;

  const candidates: PortalNewsItem[] = [];

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
  const matched = sorted.filter((item) =>
    itemMatchesTerms(item, analysisOpinionConfig.matchTerms),
  );
  if (!matched.length) return null;

  const eyebrow = locale === "en" ? "Analysis & Opinion" : "Analisis & Opini";

  return matched.slice(0, 2).map((article, index) => {
    const slug = article.slug?.trim() || "";
    const href = slug
      ? buildAnalysisDetailHref(locale, "analisis-opinion", slug)
      : undefined;

    return {
      key: String(article.id ?? slug ?? `strategic-${index}`),
      eyebrow,
      title: resolveTitle(article, locale),
      date: formatDateTimeShort(
        article.updated_at ?? article.created_at,
        locale,
      ),
      image: resolveImage(article),
      href,
    };
  });
}

export async function HomeInsightBoards({
  locale,
  messages,
}: HomeInsightBoardsProps) {
  const readMoreLabel = messages.common?.readMore ?? "Read More";
  const tiktokItem = await fetchLatestTikTok();
  const apiStrategicItems = await getStrategicInsightItems(locale);
  const strategicItems = (
    apiStrategicItems ?? DEFAULT_STRATEGIC_ITEMS(locale)
  ).slice(0, 2);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.25fr_1.25fr_1fr]">
      <StrategicInsightBoard
        items={strategicItems}
        readMoreLabel={readMoreLabel}
      />

      <div className="flex flex-col gap-4">
        <WeeklyMarketBriefCard locale={locale} readMoreLabel={readMoreLabel} />
        <VideoBriefingCard />
      </div>

      <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
        <MarketPulseCard tiktokItem={tiktokItem} />
        <SocialLinksCard />
      </div>
    </div>
  );
}
