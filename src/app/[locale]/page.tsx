import type { Metadata } from "next";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { HeroSection } from "@/components/organisms/HeroSection";
import { PolicySnapshot } from "@/components/organisms/PolicySnapshot";
import { RegulatoryWatch } from "@/components/organisms/RegulatoryWatch";
import { MarketImpact } from "@/components/organisms/MarketImpact";
import { FocusReport } from "@/components/organisms/FocusReport";
import { RecentAnalysis } from "@/components/organisms/RecentAnalysis";
import { INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH } from "@/lib/indonesia-market-sections";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Indonesia Market",
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
    <MarketPageTemplate locale={locale} messages={messages} showPopupBanner>
      <HeroSection messages={messages} locale={locale} />
      <PolicySnapshot messages={messages} locale={locale} />
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="contents lg:flex lg:flex-col lg:gap-4">
          <div className="order-4">
            <RegulatoryWatch messages={messages} />
          </div>
          <div className="order-2">
            <RecentAnalysis
              messages={messages}
              locale={locale}
              limit={4}
              detailBasePath={INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH}
              includeCategoryName="Analisis Market"
              link={`/${locale}/indonesia-market/analysis`}
              linkLabel={messages.equities.newsCategories.viewAll}
            />
          </div>
        </div>
        <div className="contents lg:flex lg:flex-col lg:gap-4">
          <div className="order-1">
            <MarketImpact messages={messages} locale={locale} />
          </div>
          <div className="order-3">
            <FocusReport messages={messages} locale={locale} />
          </div>
        </div>
      </div>
    </MarketPageTemplate>
  );
}
