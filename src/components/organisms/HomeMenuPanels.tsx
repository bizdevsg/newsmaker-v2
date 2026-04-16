import React from "react";
import type { Locale, Messages } from "@/locales";
import { TechnicalAnalysisIndicatorCard } from "./home-panels/TechnicalAnalysisIndicatorCard";
import { EconomicCalendarCard } from "./home-panels/EconomicCalendarCard";
import { MarketOutlookCard } from "./home-panels/MarketOutlookCard";
import { DigitalAssetsCard } from "./home-panels/DigitalAssetsCard";

type HomeMenuPanelsProps = {
  locale: Locale;
  messages: Messages;
};

export function HomeMenuPanels({ locale, messages }: HomeMenuPanelsProps) {
  const readMoreLabel = messages.common?.readMore ?? "Read More";

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr_1.25fr]">
      <div className="grid gap-4">
        <TechnicalAnalysisIndicatorCard symbol="XAUUSD" />
        <EconomicCalendarCard
          locale={locale}
          messages={messages}
        />
      </div>
      <MarketOutlookCard
        locale={locale}
        readMoreLabel={readMoreLabel}
      />
      <DigitalAssetsCard
        locale={locale}
        readMoreLabel={readMoreLabel}
      />
    </section>
  );
}
