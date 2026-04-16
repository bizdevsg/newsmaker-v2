import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { DisclaimerCard } from "@/components/organisms/DisclaimerCard";
import { Header } from "@/components/organisms/Header";
import { HeroSection } from "@/components/organisms/HeroSection";
import { HomeInsightBoards } from "@/components/organisms/HomeInsightBoards";
import { HomeMenuPanels } from "@/components/organisms/HomeMenuPanels";
import { InsightHub } from "@/components/organisms/InsightHub";
import { LiveQuotesBoard } from "@/components/organisms/LiveQuotesBoard";
import { NmAi } from "@/components/organisms/NmAi";
import { Tagline } from "@/components/organisms/Tagline";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";

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
    <MarketPageTemplate locale={locale} messages={messages} showPopupBanner>
      <div className="flex flex-col gap-6">
        <div className="px-4">
          <Container as="section">
            <div className="flex flex-col gap-4">
              <Header />
              <HeroSection messages={messages} locale={locale} />
              <LiveQuotesBoard
                locale={locale}
                messages={messages}
                title={messages.focusReport.kicker}
                limit={9}
              />
              <HomeMenuPanels locale={locale} messages={messages} />
              <InsightHub locale={locale} />
            </div>
          </Container>
        </div>

        <section className="bg-blue-200/50 px-4">
          <Container className="py-6">
            <HomeInsightBoards locale={locale} messages={messages} />
          </Container>
        </section>

        <Container as="section" className="mt-4 px-4">
          <div className="flex flex-col gap-4">
            <DisclaimerCard />
            <NmAi />
            <Tagline />
          </div>
        </Container>
      </div>
    </MarketPageTemplate>
  );
}
