import type { Metadata } from "next";
import { NewsCategoryList } from "@/components/organisms/NewsCategoryList";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH } from "@/lib/indonesia-market-sections";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Global Economics News",
};

export default async function IndonesiaMarketNewsPage({
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
      activeNavKey: "home",
    },
  };
  const globalEconomicsLabel = "Global Economics";

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <section className="min-h-[60vh] rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <NewsCategoryList
          categorySlug="global-economics"
          locale={locale}
          messages={customMessages}
          labelOverride={globalEconomicsLabel}
          detailBasePath={INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}
          parentHref={`/${locale}`}
          parentLabel={messages.hero.title}
          emptyLabel={
            locale === "en"
              ? "No Global Economics news is available yet."
              : "Belum ada berita Global Economics."
          }
        />
      </section>
    </MarketPageTemplate>
  );
}
