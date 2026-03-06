import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { LiveChartSection } from "@/components/organisms/LiveChartSection";
import { getMessages, type Locale } from "@/locales";
import type { Metadata } from "next";
import { RecentAnalysisTableSection } from "@/components/organisms/RecentAnalysisTableSection";

export const metadata: Metadata = {
  title: "Markets",
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
      <LiveChartSection />

      <RecentAnalysisTableSection />
    </MarketPageTemplate>
  );
}
