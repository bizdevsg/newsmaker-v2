import type { Metadata } from "next";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import {
  toEconomicNewsCardItemsAuto,
  toMarketNewsCardItemsAuto,
} from "@/lib/news-cards";
import {
  inferEconomicNewsCategoryFromItem,
  inferMarketNewsCategoryFromItem,
} from "@/lib/news-routing";
import { fetchPortalNewsList } from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Latest News",
};

export default async function NewsIndexPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const title = locale === "en" ? "Latest News" : "Berita Terbaru";

  const { items } = await fetchPortalNewsList();
  const nonAnalysisItems = items.filter((item) => {
    if (item.type?.toLowerCase() === "analisis") return false;
    return true;
  });

  const marketItems = nonAnalysisItems.filter((item) => {
    const category = inferMarketNewsCategoryFromItem(item);
    return category !== null;
  });

  const economicItems = nonAnalysisItems.filter((item) => {
    return inferEconomicNewsCategoryFromItem(item) !== null;
  });

  const cards = [
    ...toMarketNewsCardItemsAuto(marketItems, { locale, limit: 120 }),
    ...toEconomicNewsCardItemsAuto(economicItems, { locale, limit: 120 }),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 120);

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
              locale === "en" ? "No articles yet." : "Belum ada berita."
            }
          />
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
