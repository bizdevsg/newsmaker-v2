import { MarketPageTemplate } from "../components/templates/MarketPageTemplate";
import { HeroSection } from "../components/organisms/HeroSection";
import { PolicySnapshot } from "../components/organisms/PolicySnapshot";
import { RegulatoryWatch } from "../components/organisms/RegulatoryWatch";
import { MarketImpact } from "../components/organisms/MarketImpact";
import { ExchangeActivity } from "../components/organisms/ExchangeActivity";
import { FocusReport } from "../components/organisms/FocusReport";
import { RecentAnalysis } from "../components/organisms/RecentAnalysis";

export default function Home() {
  return (
    <MarketPageTemplate>
      <HeroSection />
      <PolicySnapshot />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <RegulatoryWatch />
          <ExchangeActivity />
          <RecentAnalysis />
        </div>
        <div className="space-y-6">
          <MarketImpact />
          <FocusReport />
        </div>
      </div>
    </MarketPageTemplate>
  );
}


