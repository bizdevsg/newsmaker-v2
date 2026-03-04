import { MarketPageTemplate } from "../../../components/templates/MarketPageTemplate";
import { HeroSection } from "../../../components/organisms/HeroSection";
import { PolicySnapshot } from "../../../components/organisms/PolicySnapshot";
import { RegulatoryWatch } from "../../../components/organisms/RegulatoryWatch";
import { MarketImpact } from "../../../components/organisms/MarketImpact";
import { ExchangeActivity } from "../../../components/organisms/ExchangeActivity";
import { FocusReport } from "../../../components/organisms/FocusReport";
import { RecentAnalysis } from "../../../components/organisms/RecentAnalysis";
import { getMessages, type Locale } from "@/locales";

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
      <HeroSection messages={messages} />
      <PolicySnapshot messages={messages} />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <RegulatoryWatch messages={messages} />
          <ExchangeActivity messages={messages} />
          <RecentAnalysis messages={messages} />
        </div>
        <div className="space-y-6">
          <MarketImpact messages={messages} />
          <FocusReport messages={messages} />
        </div>
      </div>
    </MarketPageTemplate>
  );
}
