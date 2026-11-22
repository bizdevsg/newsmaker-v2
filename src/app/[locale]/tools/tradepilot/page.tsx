import type { Metadata } from "next";

import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";

const TRADEPILOT_URL = "https://tradepilot.id/";

export const metadata: Metadata = {
  title: "Trade Pilot",
};

export default async function TradePilotPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  return (
    <MarketPageTemplate locale={locale} messages={messages} fullHeight>
      {/* Trade Pilot scrolls inside the frame; the page itself stays put. */}
      <iframe
        src={TRADEPILOT_URL}
        title="Trade Pilot"
        className="block h-full w-full border-0 bg-white"
        allow="clipboard-write; fullscreen"
      />
    </MarketPageTemplate>
  );
}
