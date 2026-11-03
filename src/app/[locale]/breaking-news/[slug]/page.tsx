import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/Container";
import { NewsArticleDetail } from "@/components/organisms/news/NewsArticleDetail";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import {
  fetchBreakingNewsArticle,
  resolveBreakingNewsImage,
  resolveBreakingNewsTitle,
} from "@/lib/breaking-news.server";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Breaking News",
};

export default async function BreakingNewsDetailPage({
  params,
}: {
  params: Promise<{ locale?: string; slug?: string }>;
}) {
  const { locale: rawLocale, slug: rawSlug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const slug = decodeURIComponent(rawSlug ?? "").trim();
  if (!slug) notFound();

  const item = await fetchBreakingNewsArticle(slug);
  if (!item) notFound();

  const title = resolveBreakingNewsTitle(item, locale);
  const html =
    (locale === "en"
      ? item.content_en?.trim() || item.content_id?.trim()
      : item.content_id?.trim() || item.content_en?.trim()) || "";

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <NewsArticleDetail
          locale={locale}
          title={title}
          html={html}
          imageUrl={resolveBreakingNewsImage(item)}
          badgeLabel={item.breaking_news_category?.name ?? "Breaking News"}
          authorLabel={item.author || null}
          sourceLabel={item.source || null}
          publishedAt={item.created_at ?? item.updated_at ?? null}
          shareHref={`/${locale}/breaking-news/${encodeURIComponent(slug)}`}
          breadcrumb={[
            { label: "News", href: `/${locale}/news` },
            { label: "Breaking News" },
            { label: title },
          ]}
        />
      </Container>
    </MarketPageTemplate>
  );
}
