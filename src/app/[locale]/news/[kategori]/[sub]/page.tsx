import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsArticleDetail } from "@/components/organisms/news/NewsArticleDetail";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { filterItemsByTerms } from "@/lib/news-filter";
import { toMarketNewsCardItemsAuto, toNewsCardItems } from "@/lib/news-cards";
import {
  buildNewsCategoryHref,
  getNewsCategoryConfig,
  getNewsSubConfig,
  resolveNewsCategoryLabel,
  resolveNewsSubLabel,
} from "@/lib/news-routing";
import {
  fetchPortalNewsArticle,
  fetchPortalNewsList,
  fetchPortalNewsListByCategory,
} from "@/lib/portalnews";
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

export default async function NewsSubPage({
  params,
}: {
  params: Promise<{ locale?: string; kategori?: string; sub?: string }>;
}) {
  const {
    locale: rawLocale,
    kategori: rawKategori,
    sub: rawSub,
  } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const kategori = decodeURIComponent(rawKategori ?? "").trim();
  if (!kategori) notFound();
  const categoryConfig = getNewsCategoryConfig(kategori);
  if (!categoryConfig) notFound();

  const sub = decodeURIComponent(rawSub ?? "").trim();
  if (!sub) notFound();

  // Special-case: crypto detail route is /news/crypto/:slug
  if (kategori === "crypto") {
    const slug = sub;
    const { item } = await fetchPortalNewsArticle(slug);
    if (!item) notFound();

    const title = resolveTitle(item, locale);
    const categoryLabel = resolveNewsCategoryLabel(messages, kategori);
    const categoryHref = buildNewsCategoryHref(locale, kategori);
    const contentHtml = resolveContentHtml(item, locale);
    const imageUrl = item.image_url || item.image || item.images?.[0] || null;
    const publishedAt = item.updated_at ?? item.created_at ?? null;
    const authorLabel =
      typeof item.author === "string" ? item.author : item.author?.name || "";
    const sourceLabel = item.source || "";

    const relatedResult = await fetchPortalNewsListByCategory("crypto");
    const relatedItems =
      relatedResult.ok && relatedResult.items.length
        ? toNewsCardItems(
            relatedResult.items.filter((candidate) => candidate.slug !== slug),
            {
              locale,
              kategori: "crypto",
              fixedSub: null,
              inferSubs: null,
              limit: 6,
            },
          )
        : [];

	    const { items: allItems } = await fetchPortalNewsList();
		    const latestItems = toMarketNewsCardItemsAuto(
		      allItems.filter((candidate) => candidate.slug !== slug),
		      { locale, limit: 5 },
		    );
	    const popularItems = (() => {
	      const latestKeys = new Set(latestItems.map((entry) => entry.key));
	      const candidates = toMarketNewsCardItemsAuto(
	        allItems.filter((candidate) => candidate.slug !== slug),
	        { locale, limit: 80 },
	      )
	        .filter((entry) => !latestKeys.has(entry.key));

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
            badgeLabel={categoryLabel}
            authorLabel={authorLabel}
            sourceLabel={sourceLabel}
            publishedAt={publishedAt}
            shareHref={`/${locale}/news/${encodeURIComponent(
              kategori,
            )}/${encodeURIComponent(slug)}`}
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

  const apiResult = await fetchPortalNewsListByCategory(sub);
  const canUseApi = apiResult.ok && apiResult.items.length > 0;

  if (canUseApi) {
    const cards = toNewsCardItems(apiResult.items, {
      locale,
      kategori,
      fixedSub: sub,
      inferSubs: null,
    });

    const categoryLabel = resolveNewsCategoryLabel(messages, kategori);
    const subLabel =
      apiResult.category?.name?.trim() ||
      resolveNewsSubLabel(messages, kategori, sub);
    const backHref = buildNewsCategoryHref(locale, kategori);

    return (
      <MarketPageTemplate locale={locale} messages={messages}>
        <Container as="section" className="py-8">
          <Card className="overflow-hidden">
            <NewsListView
              title={subLabel}
              locale={locale}
              breadcrumb={[
                { label: "News", href: `/${locale}/news` },
                { label: categoryLabel, href: backHref },
                { label: subLabel },
              ]}
              items={cards}
              backHref={backHref}
              backLabel={
                locale === "en" ? "Back to Category" : "Kembali ke Kategori"
              }
              emptyMessage={
                locale === "en"
                  ? "No articles yet."
                  : `Belum ada berita untuk ${subLabel.toLowerCase()}.`
              }
            />
          </Card>
        </Container>
      </MarketPageTemplate>
    );
  }

  const subConfig = getNewsSubConfig(kategori, sub);
  if (!subConfig) notFound();

  const { items } = await fetchPortalNewsList();
  const filtered = filterItemsByTerms(items, subConfig.matchTerms);
  const cards = toNewsCardItems(filtered, {
    locale,
    kategori,
    fixedSub: sub,
    inferSubs: null,
  });

  const categoryLabel = resolveNewsCategoryLabel(messages, kategori);
  const subLabel = resolveNewsSubLabel(messages, kategori, sub);
  const backHref = buildNewsCategoryHref(locale, kategori);

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8">
        <Card className="overflow-hidden">
          <NewsListView
            title={subLabel}
            locale={locale}
            breadcrumb={[
              { label: "News", href: `/${locale}/news` },
              { label: categoryLabel, href: backHref },
              { label: subLabel },
            ]}
            items={cards}
            backHref={backHref}
            backLabel={
              locale === "en" ? "Back to Category" : "Kembali ke Kategori"
            }
            emptyMessage={
              locale === "en"
                ? "No articles yet."
                : `Belum ada berita untuk ${subLabel.toLowerCase()}.`
            }
          />
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
