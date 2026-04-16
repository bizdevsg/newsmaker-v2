import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/Container";
import { NewsArticleDetail } from "@/components/organisms/news/NewsArticleDetail";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import {
  buildEconomicNewsListHref,
  getEconomicNewsConfig,
  inferEconomicNewsCategoryFromItem,
  isGlobalEconomyGroupSlug,
  resolveEconomicNewsLabel,
} from "@/lib/news-routing";
import { toEconomicNewsCardItems, toEconomicNewsCardItemsAuto } from "@/lib/news-cards";
import { fetchPortalNewsArticle, fetchPortalNewsList } from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Economic News",
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

export default async function EconomicNewsDetailPage({
  params,
}: {
  params: Promise<{ locale?: string; sub?: string; slug?: string }>;
}) {
  const { locale: rawLocale, sub: rawSub, slug: rawSlug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const sub = decodeURIComponent(rawSub ?? "").trim();
  const config = getEconomicNewsConfig(sub);
  if (!config) notFound();

  const slug = decodeURIComponent(rawSlug ?? "").trim();
  if (!slug) notFound();

  const { item } = await fetchPortalNewsArticle(slug);
  if (!item) notFound();

  const inferred = inferEconomicNewsCategoryFromItem(item);
  if (!inferred) notFound();
  if (config.slug === "global-economy") {
    if (!isGlobalEconomyGroupSlug(inferred)) notFound();
  } else {
    if (inferred !== config.slug) notFound();
  }

  const title = resolveTitle(item, locale);
  const sectionLabel = resolveEconomicNewsLabel(messages, sub);
  const listHref = buildEconomicNewsListHref(locale, sub);
  const publishedAt = item.updated_at ?? item.created_at ?? null;
  const contentHtml = resolveContentHtml(item, locale);
  const imageUrl = item.image_url || item.image || item.images?.[0] || null;
  const authorLabel =
    typeof item.author === "string" ? item.author : item.author?.name || "";
  const sourceLabel = item.source || "";

  const { items: allItems } = await fetchPortalNewsList();
  const relatedCandidates = allItems
    .filter((candidate) => candidate.slug !== slug)
    .filter((candidate) => {
      const candidateInferred = inferEconomicNewsCategoryFromItem(candidate);
      if (!candidateInferred) return false;
      if (config.slug === "global-economy") {
        return isGlobalEconomyGroupSlug(candidateInferred);
      }
      return candidateInferred === config.slug;
    });

  const relatedItems = toEconomicNewsCardItems(relatedCandidates, {
    locale,
    sub,
    limit: 6,
  });

  const latestItems = toEconomicNewsCardItemsAuto(
    allItems.filter((candidate) => candidate.slug !== slug),
    { locale, limit: 5 },
  );

  const popularItems = (() => {
    const latestKeys = new Set(latestItems.map((entry) => entry.key));
    const candidates = toEconomicNewsCardItemsAuto(
      allItems.filter((candidate) => candidate.slug !== slug),
      { locale, limit: 80 },
    ).filter((entry) => !latestKeys.has(entry.key));

    return seededShuffle(candidates, hashSeed(slug)).slice(0, 6);
  })();

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8">
        <NewsArticleDetail
          locale={locale}
          title={title}
          html={contentHtml}
          imageUrl={imageUrl}
          badgeLabel={sectionLabel}
          authorLabel={authorLabel}
          sourceLabel={sourceLabel}
          publishedAt={publishedAt}
          shareHref={`/${locale}/economic-news/${encodeURIComponent(
            sub,
          )}/${encodeURIComponent(slug)}`}
          breadcrumb={[
            {
              label: String(messages.header.siteNav.economicNews ?? "Economic News"),
              href: `/${locale}/economic-news`,
            },
            { label: sectionLabel, href: listHref },
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
