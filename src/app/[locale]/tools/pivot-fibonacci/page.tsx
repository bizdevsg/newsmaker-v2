import type { Metadata } from "next";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { PivotFibonacciClient } from "@/components/organisms/pivot-fibonacci/PivotFibonacciClient";
import { PivotOhlcTable } from "@/components/organisms/pivot-fibonacci/PivotOhlcTable";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { fetchHistoricalData } from "@/lib/historical-data";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Pivot & Fibonacci",
};

export default async function PivotFibonacciPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const pageTitle =
    messages.header.siteNav.pivotFibonacci?.trim() || "Pivot & Fibonacci";

  // No category filter here on purpose - fetch every product once and let
  // the dropdown in PivotOhlcTable filter client-side, same convention as
  // the Historical Data tool's own page.
  const historicalItems = await fetchHistoricalData();

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <Card className="overflow-hidden">
          <SectionHeader title={pageTitle} />
          <div className="px-4 pb-6">
            <PivotFibonacciClient messages={messages} locale={locale} />
          </div>

          <div className="p-4 pt-0">
            <PivotOhlcTable locale={locale} items={historicalItems} />
          </div>
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
