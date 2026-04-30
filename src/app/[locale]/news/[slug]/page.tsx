import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { NewsArticleDetail } from "@/components/organisms/NewsArticleDetail";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { fetchPortalNewsDetail, type PortalNewsDetailResult } from "@/lib/portalnews-detail";
import { buildPortalNewsImageUrl } from "@/lib/portalnews";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";
import { getMessages, type Locale } from "@/locales";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const DETAIL_BASE_PATH = "news";

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildMetadataFromDetail = (
  detail: PortalNewsDetailResult,
  locale: Locale,
  slug: string,
): Metadata => {
  const fallbackTitle = locale === "en" ? "Latest News" : "Berita Terbaru";
  const fallbackDescription =
    locale === "en" ? "Latest news detail page." : "Halaman detail berita terbaru.";
  const article = detail.article;

  if (!article) {
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
  const canonicalUrl = SITE_URL ? `${SITE_URL}/${locale}/${DETAIL_BASE_PATH}/${slug}` : undefined;

  return {
    title,
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
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
};

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

  return buildMetadataFromDetail(detail, locale, slug);
}

export default async function GenericNewsArticlePage({
  params,
}: {
  params: Promise<{ locale?: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const detail = await fetchPortalNewsDetail(slug);

  if (!detail.article) {
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

  const listingLabel = locale === "en" ? "Latest News" : "Berita Terbaru";

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <Container className="py-8">
        <NewsArticleDetail
          slug={slug}
          locale={locale}
          detailBasePath={DETAIL_BASE_PATH}
          parentHref={`/${locale}`}
          parentLabel={messages.hero.title}
          listingHref={`/${locale}`}
          listingLabel={listingLabel}
          initialData={{
            data: detail.article,
            imageBase: detail.imageBase,
            latest: detail.latest,
            related: detail.related,
            status: "success",
          }}
          messages={customMessages}
        />
      </Container>
    </MarketPageTemplate>
  );
}
