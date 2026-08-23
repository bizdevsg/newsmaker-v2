import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { toMarketNewsCardItemsAuto } from "@/lib/news-cards";
import {
  getNewsCategoryConfig,
  inferMarketNewsCategoryFromItem,
  resolveNewsCategoryLabel,
  type NewsCategoryConfig,
} from "@/lib/news-routing";
import {
  fetchPortalNewsList,
  fetchPortalNewsListByCategory,
  getPortalNewsItemTimestamp,
  type PortalNewsItem,
} from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

const dedupeBySlug = (items: PortalNewsItem[]) => {
  const seen = new Set<string>();
  const result: PortalNewsItem[] = [];

  for (const item of items) {
    const key = item.slug ?? String(item.id ?? "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
};

async function fetchCategoryItems(
  categoryConfig: NewsCategoryConfig,
): Promise<PortalNewsItem[]> {
  const categorySlugs = categoryConfig.subs.length
    ? categoryConfig.subs.map((sub) => sub.slug)
    : [categoryConfig.slug];

  const results = await Promise.all(
    categorySlugs.map((slug) => fetchPortalNewsListByCategory(slug)),
  );

  const apiItems = dedupeBySlug(
    results.flatMap((result) => (result.ok ? result.items : [])),
  ).sort(
    (left, right) =>
      getPortalNewsItemTimestamp(right) - getPortalNewsItemTimestamp(left),
  );

  if (apiItems.length > 0) {
    return apiItems.filter(
      (item) => item.type?.toLowerCase() !== "analisis",
    );
  }

  const { items } = await fetchPortalNewsList();
  return items.filter((item) => {
    if (item.type?.toLowerCase() === "analisis") return false;
    return inferMarketNewsCategoryFromItem(item) === categoryConfig.slug;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string; kategori?: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, kategori: rawKategori } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const kategori = decodeURIComponent(rawKategori ?? "").trim();
  const categoryConfig = kategori ? getNewsCategoryConfig(kategori) : null;
  const titlePrefix = locale === "en" ? "News" : "Berita";

  if (!categoryConfig) {
    return { title: titlePrefix };
  }

  const categoryLabel = resolveNewsCategoryLabel(messages, kategori);
  return { title: `${titlePrefix} ${categoryLabel}` };
}

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

  const filtered = await fetchCategoryItems(categoryConfig);

  const cards = toMarketNewsCardItemsAuto(filtered, { locale, limit: 80 });

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
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
