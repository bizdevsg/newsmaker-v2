import type { Metadata } from "next";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { toGoldCornerCardItems } from "@/lib/news-cards";
import { fetchPortalNewsListByCategory } from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Gold Corner",
};

export default async function GoldCornerIndexPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const title = String(messages.header.siteNav.goldCorner ?? "Gold Corner");

  const result = await fetchPortalNewsListByCategory("gold-corner");
  const cards = toGoldCornerCardItems(result.items, { locale, limit: 80 });

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
              locale === "en"
                ? "No Gold Corner articles yet."
                : "Belum ada artikel Gold Corner."
            }
          />
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
