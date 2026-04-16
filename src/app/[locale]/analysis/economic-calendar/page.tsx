import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { EconomicCalendarClient } from "@/components/organisms/economic-calendar/EconomicCalendarClient";
import { fetchEconomicCalendar } from "@/lib/economic-calendar";
import { getMessages, type Locale } from "@/locales";
import { Card } from "@/components/atoms/Card";

export const metadata: Metadata = {
  title: "Economic Calendar",
};

export default async function EconomicCalendarPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);
  const items = (await fetchEconomicCalendar("today", 50)) ?? [];
  const warningText = messages.policy.quickData.economicCalendar.warningText;

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <EconomicCalendarClient
          items={items}
          locale={locale}
          messages={messages}
        />
        <Card className="mt-8 overflow-hidden">
          <div className="p-4 flex items-center gap-2 text-yellow-700 bg-yellow-100 rounded">
            <i className="fa-solid fa-circle-exclamation text-sm"></i>
            <p className="text-sm">{warningText}</p>
          </div>
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
