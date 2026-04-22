import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { LiveChartClient } from "@/components/organisms/live-chart/LiveChartClient";
import MarketQuotesWidget from "@/components/organisms/live-chart/MarketQuotesWidget";
import { TradingViewDisclaimerCard } from "@/components/organisms/live-chart/TradingViewDisclaimerCard";
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
        <div className="space-y-4">
          <MarketQuotesWidget messages={messages} locale={locale} />
          <TradingViewDisclaimerCard warningText={warningText} />
          <LiveChartClient locale={locale} title={pageTitle} />
        </div>
      </Container>
    </MarketPageTemplate>
  );
}
