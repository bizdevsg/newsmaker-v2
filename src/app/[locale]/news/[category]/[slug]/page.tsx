import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleDetail } from "@/components/organisms/NewsArticleDetail";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { buildPortalNewsImageUrl } from "@/lib/portalnews";
import { fetchPortalNewsDetail } from "@/lib/portalnews-detail";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";
import { getMessages, type Locale } from "@/locales";

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
  params: Promise<{ locale?: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, category, slug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const detail = await fetchPortalNewsDetail(slug, {
    latestLimit: 1,
    popularLimit: 1,
    relatedLimit: 1,
  });
  const article = detail.article;

  if (!article) {
    return {
      title: "News Article",
      description: "Market news detail page",
    };
  }

  const title = resolvePortalNewsTitle(article, locale, "News Article");
  const description =
    stripHtml(resolvePortalNewsContent(article, locale)).slice(0, 160) ||
    "Market news detail page";
  const articleCategorySlug = article.kategori?.slug ?? category;
  const imageUrl = buildPortalNewsImageUrl(article.images?.[0]) ?? undefined;
  const canonicalUrl = SITE_URL
    ? `${SITE_URL}/${locale}/news/${articleCategorySlug}/${slug}`
    : undefined;

  return {
    title,
    description,
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

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale?: string; category: string; slug: string }>;
}) {
  const { locale: rawLocale, category, slug } = await params;
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
      activeNavKey: "equities",
    },
  };

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <section className="min-h-[80vh] rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <NewsArticleDetail
          slug={slug}
          categorySlug={category}
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
