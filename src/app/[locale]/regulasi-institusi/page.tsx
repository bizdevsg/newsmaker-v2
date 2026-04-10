import type { Metadata } from "next";
import { RegulatoryWatchNewsList } from "@/components/organisms/RegulatoryWatchNewsList";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { fetchRegulatoryWatchList } from "@/lib/regulatory-watch.server";
import { getMessages, type Locale } from "@/locales";

const REGULATORY_WATCH_BASE_PATH = "regulasi-institusi";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";

  return {
    title:
      locale === "en"
        ? "Regulatory & Institutional Watch"
        : "Pantauan Regulasi & Institusi",
  };
}

export default async function RegulatoryWatchListPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);
  const items = await fetchRegulatoryWatchList();

  const labels =
    locale === "en"
      ? {
          kicker: "Policy Monitor",
          subtitle:
            "Browse recent regulatory and institutional updates impacting Indonesia markets.",
          empty: "No regulatory updates are available yet.",
          readMore: "Read More",
        }
      : {
          kicker: "Pantauan Kebijakan",
          subtitle:
            "Lihat pembaruan regulasi dan institusi terbaru yang berdampak ke pasar Indonesia.",
          empty: "Belum ada pembaruan regulasi.",
          readMore: "Baca Lainnya",
        };

  const customMessages = {
    ...messages,
    header: {
      ...messages.header,
      activeNavKey: "policy",
    },
  };

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <section className="min-h-[60vh] rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <RegulatoryWatchNewsList
          locale={locale}
          messages={customMessages}
          items={items}
          label={messages.regulatoryWatch.title}
          parentHref={`/${locale}`}
          parentLabel={messages.hero.title}
          emptyLabel={labels.empty}
          detailBasePath={REGULATORY_WATCH_BASE_PATH}
        />
      </section>
    </MarketPageTemplate>
  );
}
