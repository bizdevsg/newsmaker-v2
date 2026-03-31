import type { Metadata } from "next";
import { NewsCategoryList } from "@/components/organisms/NewsCategoryList";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
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
          categorySlug="analysis-market-indonesia"
          locale={locale}
          messages={customMessages}
          labelOverride={analysisLabel}
          requiredMainCategorySlug="analysis-market-indonesia"
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
