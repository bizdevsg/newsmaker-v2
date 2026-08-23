import type { Metadata } from "next";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { toEconomicNewsCardItemsAuto } from "@/lib/news-cards";
import {
  ALL_ECONOMIC_NEWS_API_SLUGS,
  inferEconomicNewsCategoryFromItem,
} from "@/lib/news-routing";
import {
  fetchPortalNewsList,
  fetchPortalNewsListByCategory,
  getPortalNewsItemTimestamp,
  type PortalNewsItem,
} from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Economic News",
};

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

async function fetchAllEconomicNewsItems(): Promise<PortalNewsItem[]> {
  const results = await Promise.all(
    ALL_ECONOMIC_NEWS_API_SLUGS.map((slug) => fetchPortalNewsListByCategory(slug)),
  );

  const apiItems = dedupeBySlug(
    results.flatMap((result) => (result.ok ? result.items : [])),
  ).sort(
    (left, right) =>
      getPortalNewsItemTimestamp(right) - getPortalNewsItemTimestamp(left),
  );

  if (apiItems.length > 0) return apiItems;

  const { items } = await fetchPortalNewsList();
  return items.filter((item) => inferEconomicNewsCategoryFromItem(item) !== null);
}

export default async function EconomicNewsIndexPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const title = String(messages.header.siteNav.economicNews ?? "Economic News");

  const filtered = await fetchAllEconomicNewsItems();

  const cards = toEconomicNewsCardItemsAuto(filtered, { locale, limit: 80 });

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <Card className="overflow-hidden">
          <NewsListView
            title={title}
            locale={locale}
            breadcrumb={[{ label: title }]}
            items={cards}
            backHref={null}
            backLabel={null}
            emptyMessage={
              locale === "en" ? "No articles yet." : "Belum ada berita ekonomi."
            }
          />
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
