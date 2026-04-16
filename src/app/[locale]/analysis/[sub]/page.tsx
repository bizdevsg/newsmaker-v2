import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { toAnalysisCardItems } from "@/lib/news-cards";
import {
  getAnalysisConfig,
  inferAnalysisCategoryFromItem,
  resolveAnalysisLabel,
} from "@/lib/news-routing";
import { fetchPortalNewsList } from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Analysis",
};

export default async function AnalysisSubPage({
  params,
}: {
  params: Promise<{ locale?: string; sub?: string }>;
}) {
  const { locale: rawLocale, sub: rawSub } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const sub = decodeURIComponent(rawSub ?? "").trim();
  const config = getAnalysisConfig(sub);
  if (!config) notFound();

  const sectionLabel = resolveAnalysisLabel(messages, sub);

  const { items } = await fetchPortalNewsList();
  const filtered = items.filter(
    (item) => inferAnalysisCategoryFromItem(item) === config.slug,
  );
  const cards = toAnalysisCardItems(filtered, { locale, sub, limit: 80 });

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <Card className="overflow-hidden">
          <NewsListView
            title={sectionLabel}
            locale={locale}
            breadcrumb={[
              {
                label: String(messages.header.siteNav.analysis ?? "Analysis"),
                href: `/${locale}/analysis`,
              },
              { label: sectionLabel },
            ]}
            items={cards}
            backHref={`/${locale}/analysis`}
            backLabel={
              locale === "en" ? "Back to Sections" : "Kembali ke Kategori"
            }
            emptyMessage={
              locale === "en"
                ? "No articles yet."
                : `Belum ada ${sectionLabel.toLowerCase()}.`
            }
          />
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
