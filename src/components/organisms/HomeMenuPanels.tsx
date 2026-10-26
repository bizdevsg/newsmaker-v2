import React from "react";
import type { Locale, Messages } from "@/locales";
import { HistoricalDataMiniCard } from "./home-insight-boards/HistoricalDataMiniCard";
import { pickLatestHistoricalRows } from "./home-insight-boards/historicalMini";
import { fetchHistoricalData } from "@/lib/historical-data";
import { EconomicCalendarCard } from "./home-panels/EconomicCalendarCard";
import { MarketOutlookCard } from "./home-panels/MarketOutlookCard";
import { DigitalAssetsCard } from "./home-panels/DigitalAssetsCard";

type HomeMenuPanelsProps = {
  locale: Locale;
  messages: Messages;
};

export async function HomeMenuPanels({
  locale,
  messages,
}: HomeMenuPanelsProps) {
  const readMoreLabel = messages.common?.readMore ?? "Read More";
  const historicalItems = pickLatestHistoricalRows(
    await fetchHistoricalData(),
  );

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr_1.25fr]">
      <div className="flex flex-col gap-4">
        <HistoricalDataMiniCard locale={locale} items={historicalItems} />
        <EconomicCalendarCard locale={locale} messages={messages} />
      </div>
      <MarketOutlookCard locale={locale} readMoreLabel={readMoreLabel} />
      <DigitalAssetsCard locale={locale} readMoreLabel={readMoreLabel} />
    </section>
  );
}
