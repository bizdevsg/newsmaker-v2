import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { LiveTvClient } from "@/components/organisms/live-tv/LiveTvClient";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Live TV",
};

export default async function LiveTvPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="px-4 py-8">
        <LiveTvClient locale={locale} />
      </Container>
    </MarketPageTemplate>
  );
}
