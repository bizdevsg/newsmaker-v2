import type { Metadata } from "next";
import { NewsCategoryList } from "@/components/organisms/NewsCategoryList";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import {
  INDONESIA_MARKET_ANALYSIS_CATEGORY_SLUG,
  INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH,
} from "@/lib/indonesia-market-sections";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Indonesia Market Analysis",
};

export default async function IndonesiaMarketAnalysisPage({
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

  const analysisLabel =
    locale === "en"
      ? "Analysis Market Indonesia"
      : "Analisis Market Indonesia";

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <section className="min-h-[60vh] rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <NewsCategoryList
          categorySlug={INDONESIA_MARKET_ANALYSIS_CATEGORY_SLUG}
          locale={locale}
          messages={customMessages}
          labelOverride={analysisLabel}
          detailBasePath={INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH}
          parentHref={`/${locale}`}
          parentLabel={messages.hero.title}
          emptyLabel={
            locale === "en"
              ? "No Indonesia Market analysis is available yet."
              : "Belum ada analisis Indonesia Market."
          }
        />
      </section>
    </MarketPageTemplate>
  );
}
