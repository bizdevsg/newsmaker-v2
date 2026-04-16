import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { toEconomicNewsCardItems } from "@/lib/news-cards";
import {
  getEconomicNewsConfig,
  inferEconomicNewsCategoryFromItem,
  isGlobalEconomyGroupSlug,
  resolveEconomicNewsLabel,
} from "@/lib/news-routing";
import { fetchPortalNewsList } from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Economic News",
};

export default async function EconomicNewsSubPage({
  params,
}: {
  params: Promise<{ locale?: string; sub?: string }>;
}) {
  const { locale: rawLocale, sub: rawSub } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const sub = decodeURIComponent(rawSub ?? "").trim();
  const config = getEconomicNewsConfig(sub);
  if (!config) notFound();

  const sectionLabel = resolveEconomicNewsLabel(messages, sub);

  const { items } = await fetchPortalNewsList();
  const filtered = items.filter((item) => {
    const inferred = inferEconomicNewsCategoryFromItem(item);
    if (!inferred) return false;
    if (config.slug === "global-economy") {
      return isGlobalEconomyGroupSlug(inferred);
    }
    return inferred === config.slug;
  });
  const cards = toEconomicNewsCardItems(filtered, { locale, sub, limit: 80 });

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <Card className="overflow-hidden">
          <NewsListView
            title={sectionLabel}
            locale={locale}
            breadcrumb={[
              {
                label: String(
                  messages.header.siteNav.economicNews ?? "Economic News",
                ),
                href: `/${locale}/economic-news`,
              },
              { label: sectionLabel },
            ]}
            items={cards}
            backHref={`/${locale}/economic-news`}
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
