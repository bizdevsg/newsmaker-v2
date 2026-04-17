import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleDetail } from "@/components/organisms/NewsArticleDetail";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import {
  resolveRegulatoryWatchContent,
  resolveRegulatoryWatchImage,
  resolveRegulatoryWatchTitle,
  type RegulatoryWatchItem,
  stripHtml,
} from "@/lib/regulatory-watch";
import {
  fetchRegulatoryWatchDetail,
  fetchRegulatoryWatchList,
} from "@/lib/regulatory-watch.server";
import { getMessages, type Locale } from "@/locales";
import { Container } from "@/components/layout/Container";

const REGULATORY_WATCH_BASE_PATH = "regulasi-institusi";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

type NewsArticleLikeItem = {
  id?: number;
  slug?: string;
  image?: string;
  image_url?: string;
  title_id?: string;
  title_en?: string;
  content_id?: string;
  content_en?: string;
  category?: string;
  category_label?: string;
  source?: string;
  author?:
    | string
    | {
        id?: number;
        name?: string;
        email?: string;
      };
  created_at?: string;
  updated_at?: string;
};

const normalizeText = (value?: string | null) => {
  if (!value) return "";
  return value.trim();
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const resolveCategoryLabel = (item: RegulatoryWatchItem, locale: Locale) =>
  normalizeText(item.category_label) ||
  normalizeText(item.category) ||
  (locale === "en" ? "Regulation" : "Regulasi");

const STOPWORDS = new Set([
  "yang",
  "dan",
  "di",
  "ke",
  "dari",
  "untuk",
  "pada",
  "dalam",
  "dengan",
  "karena",
  "setelah",
  "akan",
  "oleh",
  "atau",
  "ini",
  "itu",
  "para",
  "sejumlah",
  "lebih",
  "masih",
  "hingga",
  "saat",
  "juga",
  "agar",
  "namun",
  "serta",
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "amid",
  "after",
  "before",
  "over",
  "under",
  "today",
  "market",
  "markets",
  "news",
  "regulation",
  "policy",
  "indonesia",
  "indonesian",
]);

const tokenize = (value: string) =>
  stripHtml(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length > 2 && !STOPWORDS.has(token) && !/^\d+$/.test(token),
    );

const toFrequencyMap = (tokens: string[]) => {
  const map = new Map<string, number>();
  for (const token of tokens) {
    map.set(token, (map.get(token) ?? 0) + 1);
  }
  return map;
};

const getTimestamp = (item: RegulatoryWatchItem) =>
  new Date(item.updated_at ?? item.created_at ?? 0).getTime();

const getSimilarityScore = (
  baseItem: RegulatoryWatchItem,
  candidate: RegulatoryWatchItem,
  locale: Locale,
) => {
  const baseText = `${resolveRegulatoryWatchTitle(baseItem, locale)} ${resolveRegulatoryWatchContent(baseItem, locale)}`;
  const candidateText = `${resolveRegulatoryWatchTitle(candidate, locale)} ${resolveRegulatoryWatchContent(candidate, locale)}`;

  const baseTokens = tokenize(baseText);
  const candidateTokens = tokenize(candidateText);

  if (!baseTokens.length || !candidateTokens.length) return 0;

  const baseFreq = toFrequencyMap(baseTokens);
  const candidateFreq = toFrequencyMap(candidateTokens);

  let overlapScore = 0;
  for (const [token, count] of baseFreq.entries()) {
    overlapScore += Math.min(count, candidateFreq.get(token) ?? 0);
  }

  const uniqueBase = new Set(baseTokens);
  const uniqueCandidate = new Set(candidateTokens);

  let unionCount = uniqueBase.size;
  for (const token of uniqueCandidate) {
    if (!uniqueBase.has(token)) {
      unionCount += 1;
    }
  }

  const jaccard = unionCount > 0 ? overlapScore / unionCount : 0;

  const categoryBoost =
    resolveCategoryLabel(baseItem, locale).toLowerCase() ===
    resolveCategoryLabel(candidate, locale).toLowerCase()
      ? 0.15
      : 0;

  const recencyBoost =
    Math.max(
      0,
      1 -
        Math.abs(getTimestamp(baseItem) - getTimestamp(candidate)) /
          (1000 * 60 * 60 * 24 * 30),
    ) * 0.06;

  return jaccard + categoryBoost + recencyBoost;
};

const mapToNewsArticleLike = (
  item: RegulatoryWatchItem,
  locale: Locale,
): NewsArticleLikeItem => {
  const imageUrl = resolveRegulatoryWatchImage(item);
  const categoryLabel = resolveCategoryLabel(item, locale);
  const titleId = normalizeText(item.title_id) || undefined;
  const titleEn = normalizeText(item.title_en) || undefined;
  const contentId = normalizeText(item.content_id) || undefined;
  const contentEn = normalizeText(item.content_en) || undefined;

  return {
    id: item.id,
    slug: normalizeText(item.slug) || undefined,
    image_url: imageUrl ?? undefined,
    image: imageUrl ?? undefined,
    title_id: titleId,
    title_en: titleEn,
    content_id: contentId,
    content_en: contentEn,
    category_label: categoryLabel,
    category: normalizeText(item.category) || "regulasi-institusi",
    source: normalizeText(item.source) || "Newsmaker.id",
    author: item.author,
    created_at: normalizeText(item.created_at) || undefined,
    updated_at: normalizeText(item.updated_at) || undefined,
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const detail = await fetchRegulatoryWatchDetail(slug);

  if (!detail) {
    return {
      title:
        locale === "en"
          ? "Regulatory & Institutional Watch"
          : "Pantauan Regulasi & Institusi",
    };
  }

  const title = resolveRegulatoryWatchTitle(detail, locale);
  const description = stripHtml(
    resolveRegulatoryWatchContent(detail, locale),
  ).slice(0, 160);
  const imageUrl = resolveRegulatoryWatchImage(detail) ?? undefined;
  const canonicalUrl = SITE_URL
    ? `${SITE_URL}/${locale}/${REGULATORY_WATCH_BASE_PATH}/${slug}`
    : undefined;

  return {
    title,
    description:
      description ||
      (locale === "en"
        ? "Regulatory and institutional update."
        : "Pembaruan regulasi dan institusi."),
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    openGraph: {
      title,
      description:
        description ||
        (locale === "en"
          ? "Regulatory and institutional update."
          : "Pembaruan regulasi dan institusi."),
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      type: "article",
      url: canonicalUrl,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description:
        description ||
        (locale === "en"
          ? "Regulatory and institutional update."
          : "Pembaruan regulasi dan institusi."),
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function RegulatoryWatchDetailPage({
  params,
}: {
  params: Promise<{ locale?: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);
  const [detail, listItems] = await Promise.all([
    fetchRegulatoryWatchDetail(slug),
    fetchRegulatoryWatchList(),
  ]);

  if (!detail) {
    notFound();
  }

  const mappedDetail = mapToNewsArticleLike(detail, locale);
  const currentSlug = normalizeText(detail.slug);
  const siblingItems = listItems
    .filter(
      (item) =>
        normalizeText(item.slug) && normalizeText(item.slug) !== currentSlug,
    )
    .sort((a, b) => getTimestamp(b) - getTimestamp(a));

  const latestItems = siblingItems
    .slice(0, 5)
    .map((item) => mapToNewsArticleLike(item, locale));

  const scoredRelated = siblingItems
    .map((item) => ({
      item,
      score: getSimilarityScore(detail, item, locale),
      timestamp: getTimestamp(item),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.timestamp - a.timestamp;
    });

  const strongMatches = scoredRelated.filter((entry) => entry.score > 0);
  const relatedSource = strongMatches.length ? strongMatches : scoredRelated;

  const relatedItems = relatedSource
    .slice(0, 3)
    .map((entry) => mapToNewsArticleLike(entry.item, locale));

  const customMessages = {
    ...messages,
    header: {
      ...messages.header,
      activeNavKey: "policy",
    },
  };

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <Container className="py-8">
        <NewsArticleDetail
          slug={slug}
          categorySlug="regulasi"
          detailBasePath={REGULATORY_WATCH_BASE_PATH}
          parentHref={`/${locale}`}
          parentLabel={messages.hero.title}
          listingHref={`/${locale}/${REGULATORY_WATCH_BASE_PATH}`}
          listingLabel={messages.regulatoryWatch.title}
          initialData={{
            data: mappedDetail,
            imageBase: "",
            latest: latestItems,
            related: relatedItems,
            status: "success",
          }}
          locale={locale}
          messages={customMessages}
        />
      </Container>
    </MarketPageTemplate>
  );
}
