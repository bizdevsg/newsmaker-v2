import { MarketPageTemplate } from "../../../components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";
import type { Metadata } from "next";

// Generic Market Components
import { LiveChartSection } from "@/components/organisms/LiveChartSection";
import { MarketOutlookSection } from "@/components/organisms/MarketOutlookSection";
import CalenderEkonomiHome from "@/components/organisms/CalenderEkonomiHome";
import { TikTokEmbedCard } from "@/components/organisms/TikTokEmbedCard";
import { DisclaimerCard } from "@/components/organisms/DisclaimerCard";
import { NmAiStatementCard } from "@/components/organisms/NmAiStatementCard";
import { Card } from "@/components/atoms/Card";

// Specific for Indonesia Market Layout
import { LiveQuotesWidget } from "@/components/organisms/LiveQuotesWidget";
import { MarketInsightHero } from "@/components/organisms/MarketInsightHero";
import { TechnicalAnalysisArea } from "@/components/organisms/TechnicalAnalysisArea";
import { EducationBannerCard } from "@/components/organisms/EducationBannerCard";
import { IndoMarketImpact } from "@/components/organisms/IndoMarketImpact";
import { IndoMarketInsight } from "@/components/organisms/IndoMarketInsight";
import { IndoMarketHighlight } from "@/components/organisms/IndoMarketHighlight";
import { VideoBriefingCard } from "@/components/organisms/VideoBriefingCard";

export const metadata: Metadata = {
   title: "Indonesia Market | NewsMaker",
};

export default async function IndonesiaMarketHome({
   params,
}: {
   params: Promise<{ locale?: string }>;
}) {
   const { locale: rawLocale } = await params;
   const locale: Locale = rawLocale === "en" ? "en" : "id";
   const messages = getMessages(locale);

   return (
      <MarketPageTemplate locale={locale} messages={messages}>

         {/* 1. TOP ROW: 2 MAIN COLUMNS */}
         <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_3.7fr] gap-6 items-start">

            {/* Left Column: Live Quotes & Mini Calendar */}
            <div className="flex flex-col gap-6">
               <div className="h-[450px]">
                  {/* TradingView Market Quotes Widget */}
                  <LiveQuotesWidget />
               </div>
               <div className="min-h-[400px]">
                  <CalenderEkonomiHome locale={locale} messages={messages} />
               </div>
            </div>

            {/* Right Column: Hero, News List (Impact), Technical Analysis */}
            <div className="flex flex-col gap-6">
               {/* Main Hero News */}
               <div className="min-h-[380px] w-full flex">
                  <div className="w-full flex-grow">
                     <MarketInsightHero />
                  </div>
               </div>

               {/* Top Market Developments (Horizontal list memanjang) */}
               <IndoMarketImpact title={locale === "id" ? "Dampak Pasar Indonesia" : "Top Market Developments"} />

               {/* Technical Analysis Area & Chips */}
               <div className="w-full mt-4">
                  <TechnicalAnalysisArea />
               </div>
            </div>

         </div>

         {/* 2. SECOND ROW: INSIGHTS & EDUCATION BANNER */}
         <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-10 items-stretch">
            <IndoMarketInsight
               title={locale === "id" ? "Wawasan Strategis" : "Strategic Insights"}
               category="analysis-opinion"
               limit={2}
            />
            <div className="mt-6">
               <EducationBannerCard />
            </div>
         </div>

         {/* 3. THIRD ROW: CHART & VIDEO CONTENT */}
         <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-8 items-stretch border-t border-slate-200 pt-8 relative">
            <LiveChartSection />
            <VideoBriefingCard />
         </div>

         {/* 4. FOURTH ROW: OUTLOOK & MARKET PULSE */}
         <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-8 items-stretch pt-4">
            <IndoMarketInsight
               title={locale === "id" ? "Tinjauan Pasar" : "Market Insight"}
               category="analisis-market"
               limit={4}
            />
            <TikTokEmbedCard />
         </div>

         {/* 5. FIFTH ROW: HIGHLIGHTED ASSETS */}
         <div className="mt-8">
            <IndoMarketHighlight title={locale === "id" ? "Aset Digital" : "Digital Assets"} />
         </div>

         {/* 
         FOOTER: DISCLAIMERS
         <div className="mt-12 space-y-4 border-t border-slate-200 pt-8">
            <DisclaimerCard />
            <NmAiStatementCard />
         </div>
         */}

      </MarketPageTemplate>
   );
}

