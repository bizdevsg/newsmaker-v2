import type { Metadata } from "next";
import { NewsCategoryList } from "@/components/organisms/NewsCategoryList";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Indonesia Market News",
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

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <section className="min-h-[60vh] rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <NewsCategoryList
          categorySlug="indonesia-market"
          locale={locale}
          messages={customMessages}
          labelOverride={messages.hero.title}
          excludeCategoryValues={[
            "market-analysis",
            "analisis-market",
            "analysis-market-indonesia",
            "analysis",
            "analisis",
          ]}
          parentHref={`/${locale}`}
          parentLabel={messages.hero.title}
          emptyLabel={
            locale === "en"
              ? "No Indonesia Market news is available yet."
              : "Belum ada berita Indonesia Market."
          }
        />
      </section>
    </MarketPageTemplate>
  );
}
