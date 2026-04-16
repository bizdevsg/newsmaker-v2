import type { Metadata } from "next";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { toEconomicNewsCardItemsAuto } from "@/lib/news-cards";
import { inferEconomicNewsCategoryFromItem } from "@/lib/news-routing";
import { fetchPortalNewsList } from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Economic News",
};

export default async function EconomicNewsIndexPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const title = String(messages.header.siteNav.economicNews ?? "Economic News");

  const { items } = await fetchPortalNewsList();
  const filtered = items.filter(
    (item) => inferEconomicNewsCategoryFromItem(item) !== null,
  );

  const cards = toEconomicNewsCardItemsAuto(filtered, { locale, limit: 80 });

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8">
        <Card className="overflow-hidden">
          <NewsListView
            title={title}
            locale={locale}
            breadcrumb={[{ label: title }]}
            items={cards}
            backHref={null}
            backLabel={null}
            emptyMessage={
              locale === "en"
                ? "No articles yet."
                : "Belum ada berita ekonomi."
            }
          />
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
