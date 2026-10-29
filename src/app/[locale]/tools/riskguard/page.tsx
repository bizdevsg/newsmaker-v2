import type { Metadata } from "next";

import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";

const RISKGUARD_URL = "https://riskguard.newsmaker.id/";

export const metadata: Metadata = {
  title: "RiskGuard",
};

export default async function RiskGuardPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  return (
    <MarketPageTemplate locale={locale} messages={messages} fullHeight>
      {/* RiskGuard scrolls inside the frame; the page itself stays put. */}
      <iframe
        src={RISKGUARD_URL}
        title="RiskGuard"
        className="block h-full w-full border-0 bg-white"
        allow="clipboard-write; fullscreen"
      />
    </MarketPageTemplate>
  );
}
