import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { toMarketNewsCardItemsAuto } from "@/lib/news-cards";
import {
  getNewsCategoryConfig,
  inferMarketNewsCategoryFromItem,
  resolveNewsCategoryLabel,
} from "@/lib/news-routing";
import { fetchPortalNewsList } from "@/lib/portalnews";
import { getMessages, type Locale } from "@/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string; kategori?: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, kategori: rawKategori } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const kategori = decodeURIComponent(rawKategori ?? "").trim();
  const categoryConfig = kategori ? getNewsCategoryConfig(kategori) : null;
  const titlePrefix = locale === "en" ? "News" : "Berita";

  if (!categoryConfig) {
    return { title: titlePrefix };
  }

  const categoryLabel = resolveNewsCategoryLabel(messages, kategori);
  return { title: `${titlePrefix} ${categoryLabel}` };
}

export default async function NewsCategoryPage({
  params,
}: {
  params: Promise<{ locale?: string; kategori?: string }>;
}) {
  const { locale: rawLocale, kategori: rawKategori } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const kategori = decodeURIComponent(rawKategori ?? "").trim();
  if (!kategori) {
    notFound();
  }

  const categoryConfig = getNewsCategoryConfig(kategori);
  if (!categoryConfig) notFound();

  const title = resolveNewsCategoryLabel(messages, kategori);

  const { items } = await fetchPortalNewsList();
  const filtered = items.filter((item) => {
    if (item.type?.toLowerCase() === "analisis") return false;
    return inferMarketNewsCategoryFromItem(item) === categoryConfig.slug;
  });

  const cards = toMarketNewsCardItemsAuto(filtered, { locale, limit: 80 });

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <Card className="overflow-hidden">
          <NewsListView
            title={title}
            locale={locale}
            breadcrumb={[
              { label: "News", href: `/${locale}/news` },
              { label: title },
            ]}
            items={cards}
            backHref={`/${locale}/news`}
            backLabel={
              locale === "en" ? "Back to Categories" : "Kembali ke Kategori"
            }
            emptyMessage={
              locale === "en"
                ? "No articles yet."
                : `Belum ada berita untuk ${title.toLowerCase()}.`
            }
          />
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
