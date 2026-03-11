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

      <div className="grid lg:grid-cols-[1.95fr_1.05fr] gap-4">
        <MarketInsightHero />

        <MarketSnapshot locale={locale} messages={messages} />

        <LiveChartSection />

        <div className="space-y-4">
          <SectionGridCard title={messages.widgets?.sectionGridCard?.marketQuotes || "Market Quotes"} items={6} />
          <SectionGridCard title={messages.widgets?.sectionGridCard?.quickAccess || "Quick Access"} items={3} />
        </div>

        <SectionHomeOutlook locale={locale} messages={messages} />

        <CalenderEkonomiHome locale={locale} messages={messages} />

        <MarketInsightSection locale={locale} messages={messages} />

        <TikTokEmbedCard />
      </div>

      <DisclaimerCard />
      <NmAiStatementCard />
    </MarketPageTemplate>
  );
}
