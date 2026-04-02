import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleDetail } from "@/components/organisms/NewsArticleDetail";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { buildPortalNewsImageUrl } from "@/lib/portalnews";
import { fetchPortalNewsDetail } from "@/lib/portalnews-detail";
import {
  INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH,
  isIndonesiaMarketNewsArticle,
} from "@/lib/indonesia-market-sections";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";
import { getMessages, type Locale } from "@/locales";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const SECTION_LABEL = "Global Economics";

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

  if (!article || !isIndonesiaMarketNewsArticle(article)) {
    return {
      title: SECTION_LABEL,
      description:
        locale === "en"
          ? "Indonesia Market Global Economics article detail page."
          : "Halaman detail artikel Global Economics Indonesia Market.",
    };
  }

  const title = resolvePortalNewsTitle(article, locale, SECTION_LABEL);
  const description =
    stripHtml(resolvePortalNewsContent(article, locale)).slice(0, 160) ||
    (locale === "en"
      ? "Indonesia Market Global Economics article detail page."
      : "Halaman detail artikel Global Economics Indonesia Market.");
  const imageUrl = buildPortalNewsImageUrl(article.images?.[0]) ?? undefined;
  const canonicalUrl = SITE_URL
    ? `${SITE_URL}/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/${slug}`
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

export default async function IndonesiaMarketNewsArticlePage({
  params,
}: {
  params: Promise<{ locale?: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const detail = await fetchPortalNewsDetail(slug);

  if (!detail.article || !isIndonesiaMarketNewsArticle(detail.article)) {
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

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <section className="min-h-[80vh] rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <NewsArticleDetail
          slug={slug}
          categorySlug="global-economics"
          detailBasePath={INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}
          parentHref={`/${locale}`}
          parentLabel={messages.hero.title}
          listingHref={`/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}`}
          listingLabel={SECTION_LABEL}
          initialData={{
            data: detail.article,
            imageBase: detail.imageBase,
            latest: detail.latest,
            popular: detail.popular,
            related: detail.related,
            status: "success",
          }}
          locale={locale}
          messages={customMessages}
        />
      </section>
    </MarketPageTemplate>
  );
}
