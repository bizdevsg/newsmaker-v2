import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { filterItemsByTerms } from "@/lib/news-filter";
import { toNewsCardItems } from "@/lib/news-cards";
import {
  getNewsCategoryConfig,
  resolveNewsCategoryLabel,
} from "@/lib/news-routing";
import { fetchPortalNewsList } from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "News",
};

export default async function NewsCategoryPage({
  params,
}: {
  params: Promise<{ locale?: string; kategori?: string }>;
}) {
  const { locale: rawLocale, kategori: rawKategori } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const kategori = decodeURIComponent(rawKategori ?? "").trim();
  if (!kategori) {
    notFound();
  }

  const categoryConfig = getNewsCategoryConfig(kategori);
  if (!categoryConfig) notFound();

  const title = resolveNewsCategoryLabel(messages, kategori);

  const terms = categoryConfig.subs.length
    ? categoryConfig.subs.flatMap((sub) => sub.matchTerms)
    : categoryConfig.matchTerms;

  const { items } = await fetchPortalNewsList();
  const filtered = filterItemsByTerms(items, terms);

  const cards = toNewsCardItems(filtered, {
    locale,
    kategori,
    fixedSub: null,
    inferSubs: categoryConfig.subs.length ? categoryConfig.subs : null,
  });

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8">
        <Card className="overflow-hidden">
          <NewsListView
            title={title}
            locale={locale}
            breadcrumb={[
              { label: "News", href: `/${locale}/news` },
              { label: title },
            ]}
            items={cards}
            backHref={`/${locale}/news`}
            backLabel={
              locale === "en" ? "Back to Categories" : "Kembali ke Kategori"
            }
            emptyMessage={
              locale === "en"
                ? "No articles yet."
                : `Belum ada berita untuk ${title.toLowerCase()}.`
            }
          />
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
