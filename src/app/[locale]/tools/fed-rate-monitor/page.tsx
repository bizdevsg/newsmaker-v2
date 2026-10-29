import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { FedRateMonitorCard } from "@/components/organisms/fed-rate-monitor/FedRateMonitorCard";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { fetchFedRateMonitor } from "@/lib/fed-rate-monitor";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Fed Rate Monitor",
};

export default async function FedRateMonitorPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);
  const data = await fetchFedRateMonitor();

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <FedRateMonitorCard data={data} locale={locale} />
      </Container>
    </MarketPageTemplate>
  );
}
