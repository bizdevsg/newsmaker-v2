import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/Container";
import { NewsArticleDetail } from "@/components/organisms/news/NewsArticleDetail";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { toMarketNewsCardItemsAuto, toNewsCardItems } from "@/lib/news-cards";
import {
  inferMarketNewsCategoryFromItem,
  resolveNewsCategoryLabel,
} from "@/lib/news-routing";
import { fetchPortalNewsArticle, fetchPortalNewsList } from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "News",
};

const hashSeed = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededShuffle = <T,>(items: T[], seed: number) => {
  const result = [...items];
  let state = seed || 1;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const resolveTitle = (
  item: Awaited<ReturnType<typeof fetchPortalNewsArticle>>["item"],
  locale: Locale,
) => {
  if (!item) return locale === "en" ? "News Article" : "Artikel";

  if (locale === "en") {
    return (
      item.title_en?.trim() ||
      item.titles?.en?.trim() ||
      item.title?.trim() ||
      item.title_id?.trim() ||
      item.titles?.id?.trim() ||
      item.titles?.default?.trim() ||
      "News Article"
    );
  }

  return (
    item.title_id?.trim() ||
    item.titles?.id?.trim() ||
    item.title?.trim() ||
    item.title_en?.trim() ||
    item.titles?.en?.trim() ||
    item.titles?.default?.trim() ||
    "Artikel"
  );
};

const resolveContentHtml = (
  item: Awaited<ReturnType<typeof fetchPortalNewsArticle>>["item"],
  locale: Locale,
) => {
  if (!item) return "";

  return locale === "en"
    ? item.content_en?.trim() ||
        item.contents?.en?.trim() ||
        item.content?.trim() ||
        item.content_id?.trim() ||
        item.contents?.id?.trim() ||
        item.contents?.default?.trim() ||
        ""
    : item.content_id?.trim() ||
        item.contents?.id?.trim() ||
        item.content?.trim() ||
        item.content_en?.trim() ||
        item.contents?.en?.trim() ||
        item.contents?.default?.trim() ||
        "";
};

export default async function CryptoNewsDetailPage({
  params,
}: {
  params: Promise<{ locale?: string; slug?: string }>;
}) {
  const { locale: rawLocale, slug: rawSlug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const slug = decodeURIComponent(rawSlug ?? "").trim();
  if (!slug) notFound();

  const { item } = await fetchPortalNewsArticle(slug);
  if (!item) notFound();

  if (inferMarketNewsCategoryFromItem(item) !== "crypto") notFound();

  const title = resolveTitle(item, locale);
  const categoryLabel = resolveNewsCategoryLabel(messages, "crypto");
  const categoryHref = `/${locale}/news/crypto`;
  const publishedAt = item.updated_at ?? item.created_at ?? null;
  const contentHtml = resolveContentHtml(item, locale);
  const imageUrl = item.image_url || item.image || item.images?.[0] || null;
  const authorLabel =
    typeof item.author === "string" ? item.author : item.author?.name || "";
  const sourceLabel = item.source || "";

  const { items: allItems } = await fetchPortalNewsList();
  const relatedCandidates = allItems.filter(
    (candidate) =>
      candidate.slug !== slug &&
      inferMarketNewsCategoryFromItem(candidate) === "crypto",
  );
  const relatedItems = toNewsCardItems(relatedCandidates, {
    locale,
    kategori: "crypto",
    fixedSub: null,
    inferSubs: null,
    limit: 6,
  });

  const latestItems = toMarketNewsCardItemsAuto(
    allItems.filter((candidate) => candidate.slug !== slug),
    { locale, limit: 5 },
  );

  const popularItems = (() => {
    const latestKeys = new Set(latestItems.map((entry) => entry.key));
    const candidates = toMarketNewsCardItemsAuto(
      allItems.filter((candidate) => candidate.slug !== slug),
      { locale, limit: 80 },
    ).filter((entry) => !latestKeys.has(entry.key));

    return seededShuffle(candidates, hashSeed(slug)).slice(0, 6);
  })();

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <NewsArticleDetail
          locale={locale}
          title={title}
          html={contentHtml}
          imageUrl={imageUrl}
          badgeLabel={categoryLabel}
          authorLabel={authorLabel || null}
          sourceLabel={sourceLabel || null}
          publishedAt={publishedAt}
          shareHref={`/${locale}/news/crypto/${encodeURIComponent(slug)}`}
          breadcrumb={[
            { label: "News", href: `/${locale}/news` },
            { label: categoryLabel, href: categoryHref },
            { label: title },
          ]}
          latestItems={latestItems.length ? latestItems : null}
          popularItems={popularItems.length ? popularItems : null}
          relatedItems={relatedItems.length ? relatedItems : null}
        />
      </Container>
    </MarketPageTemplate>
  );
}
