import { MarketPageTemplate } from "../../../components/templates/MarketPageTemplate";
import { DataQuickView } from "../../../components/organisms/DataQuickView";
import { ExchangeActivity } from "../../../components/organisms/ExchangeActivity";
import { MarketImpact } from "../../../components/organisms/MarketImpact";
import { getMessages, type Locale } from "@/locales";

export default async function DataPage({
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
      activeNavKey: "data",
    },
  };

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <DataQuickView locale={locale} messages={customMessages} />
        </div>
        <div className="space-y-4">
          <ExchangeActivity messages={customMessages} />
          <MarketImpact messages={customMessages} />
        </div>
      </div>
    </MarketPageTemplate>
  );
}
