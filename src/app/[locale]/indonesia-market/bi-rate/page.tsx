import type { Metadata } from "next";
import { MarketPageTemplate } from "../../../../components/templates/MarketPageTemplate";
import { BiRateTable } from "../../../../components/organisms/BiRateTable";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "BI-Rate",
};

export default async function BiRatePage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const customMessages = {
    ...messages,
    header: {
      ...messages.header,
      activeNavKey: "policy",
    },
  };

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <BiRateTable messages={customMessages} />
    </MarketPageTemplate>
  );
}
