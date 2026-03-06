import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { MarketInsightHero } from "@/components/organisms/MarketInsightHero";
import { MarketInsightSection } from "@/components/organisms/MarketInsightSection";
import { MarketOutlookSection } from "@/components/organisms/MarketOutlookSection";
import { RecentAnalysis } from "@/components/organisms/RecentAnalysis";
import { getMessages, type Locale } from "@/locales";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insight",
};

export default async function InsightPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <MarketInsightHero />

      <MarketOutlookSection />

      <RecentAnalysis messages={messages} />
    </MarketPageTemplate>
  );
}
