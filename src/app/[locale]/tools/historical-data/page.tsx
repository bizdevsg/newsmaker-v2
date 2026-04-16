import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { HistoricalDataClient } from "@/components/organisms/historical-data/HistoricalDataClient";
import { MoneyExchangeCard } from "@/components/organisms/money-exchange/MoneyExchangeCard";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { fetchHistoricalData } from "@/lib/historical-data";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Historical Data",
};

export default async function HistoricalDataPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const items = await fetchHistoricalData({ limit: 200 });

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 space-y-6">
        <HistoricalDataClient locale={locale} initialItems={items} messages={messages} />

        <MoneyExchangeCard locale={locale} />
      </Container>
    </MarketPageTemplate>
  );
}
