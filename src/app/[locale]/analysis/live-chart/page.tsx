import type { Metadata } from "next";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { LiveQuotesOhlcTable } from "@/components/organisms/LiveQuotesOhlcTable";
import { LiveChartClient } from "@/components/organisms/live-chart/LiveChartClient";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Live Chart",
};

export default async function LiveChartPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);
  const warningText = messages.policy.liveChart.warningText;
  const pageTitle =
    messages.header.siteNav.liveChart?.trim() ||
    messages.policy.liveChart.title;

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <div className="mb-4">
          <LiveQuotesOhlcTable
            messages={messages}
            locale={locale}
            limit={10}
            pollIntervalMs={1000}
          />
        </div>
        <LiveChartClient locale={locale} title={pageTitle} />

        <Card className="mt-8 overflow-hidden">
          <div className="p-4 flex items-center gap-2 text-yellow-700 bg-yellow-100 rounded">
            <i className="fa-solid fa-circle-exclamation text-sm" />
            <p className="text-sm">{warningText}</p>
          </div>
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
