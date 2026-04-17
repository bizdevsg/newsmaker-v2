import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleDetail } from "@/components/organisms/NewsArticleDetail";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { buildPortalNewsImageUrl } from "@/lib/portalnews";
import { fetchPortalNewsDetail } from "@/lib/portalnews-detail";
import {
  INDONESIA_MARKET_ANALYSIS_CATEGORY_SLUG,
  INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH,
  isIndonesiaMarketAnalysisArticle,
} from "@/lib/indonesia-market-sections";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";
import { getMessages, type Locale } from "@/locales";
import { Container } from "@/components/layout/Container";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const detail = await fetchPortalNewsDetail(slug, {
    latestLimit: 1,
    popularLimit: 1,
    relatedLimit: 1,
  });
  const article = detail.article;
  const fallbackTitle =
    locale === "en" ? "Indonesia Market Analysis" : "Analisis Market Indonesia";
  const fallbackDescription =
    locale === "en"
      ? "Indonesia Market analysis detail page."
      : "Halaman detail analisis Indonesia Market.";

  if (!article || !isIndonesiaMarketAnalysisArticle(article)) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }

  const title = resolvePortalNewsTitle(article, locale, fallbackTitle);
  const description =
    stripHtml(resolvePortalNewsContent(article, locale)).slice(0, 160) ||
    fallbackDescription;
  const imageUrl = buildPortalNewsImageUrl(article.images?.[0]) ?? undefined;
  const canonicalUrl = SITE_URL
    ? `${SITE_URL}/${locale}/${INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH}/${slug}`
    : undefined;

  return {
    title,
    description,
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      type: "article",
      url: canonicalUrl,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function IndonesiaMarketAnalysisArticlePage({
  params,
}: {
  params: Promise<{ locale?: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const detail = await fetchPortalNewsDetail(slug);

  if (!detail.article || !isIndonesiaMarketAnalysisArticle(detail.article)) {
    notFound();
  }

  const messages = getMessages(locale);

  const customMessages = {
    ...messages,
    header: {
      ...messages.header,
      activeNavKey: "home",
    },
  };

  const listingLabel =
    locale === "en" ? "Analysis Market Indonesia" : "Analisis Market Indonesia";

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <Container className="py-8">
        <NewsArticleDetail
          slug={slug}
          categorySlug={INDONESIA_MARKET_ANALYSIS_CATEGORY_SLUG}
          detailBasePath={INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH}
          parentHref={`/${locale}`}
          parentLabel={messages.hero.title}
          listingHref={`/${locale}/${INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH}`}
          listingLabel={listingLabel}
          initialData={{
            data: detail.article,
            imageBase: detail.imageBase,
            latest: detail.latest,
            // popular: detail.popular,
            related: detail.related,
            status: "success",
          }}
          locale={locale}
          messages={customMessages}
        />
      </Container>
    </MarketPageTemplate>
  );
}
