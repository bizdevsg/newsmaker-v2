import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { MarketBrief } from "@/components/organisms/MarketBrief";
import { MarketInsightHero } from "@/components/organisms/MarketInsightHero";
import { MarketSnapshot } from "@/components/organisms/MarketSnapshot";
import { LiveChartSection } from "@/components/organisms/LiveChartSection";
import { SectionGridCard } from "@/components/organisms/SectionGridCard";
import { SectionHomeOutlook } from "@/components/organisms/SectionHomeOutlook";
import { MarketInsightSection } from "@/components/organisms/MarketInsightSection";
import { getMessages, type Locale } from "@/locales";
import CalenderEkonomiHome from "@/components/organisms/CalenderEkonomiHome";
import { TikTokEmbedCard } from "@/components/organisms/TikTokEmbedCard";
import { DisclaimerCard } from "@/components/organisms/DisclaimerCard";
import { NmAiStatementCard } from "@/components/organisms/NmAiStatementCard";
import type { Metadata } from "next";
import { MarketOutlookSection } from "@/components/organisms/MarketOutlookSection";
import { MarketImpact } from "@/components/organisms/MarketImpact";
import { RegulatoryWatch } from "@/components/organisms/RegulatoryWatch";
import { FocusReport } from "@/components/organisms/FocusReport";
import { ExchangeActivity } from "@/components/organisms/ExchangeActivity";
import { ToolsCard } from "@/components/organisms/ToolsCard";

export const metadata: Metadata = {
  title: "Home",
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <MarketBrief locale={locale} messages={messages} />
      <MarketInsightHero />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <CalenderEkonomiHome locale={locale} messages={messages} />

          <RegulatoryWatch messages={messages} />

          <ExchangeActivity messages={messages} />
        </div>
        <div className="space-y-4">
          <MarketImpact messages={messages} locale={locale} />

          <FocusReport messages={messages} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[2.5fr_1fr] gap-4 w-full min-w-0">
        <div className="min-w-0 space-y-4">
          <LiveChartSection />

          <ToolsCard />
        </div>
        <div className="min-w-0 space-y-4">
          <TikTokEmbedCard />
        </div>
      </div>

      <DisclaimerCard />
      <NmAiStatementCard />
    </MarketPageTemplate>
  );
}
