import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { NewsArticleDetail } from "@/components/organisms/NewsArticleDetail";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH } from "@/lib/indonesia-market-sections";
import { getMessages, type Locale } from "@/locales";
import {
  buildIndonesiaMarketNewsMetadata,
  fetchIndonesiaMarketNewsDetail,
  isValidIndonesiaMarketNewsArticle,
} from "@/lib/indonesia-market-news";
import { Container } from "@/components/layout/Container";

const CATEGORY_LABELS = {
  all: { en: "Latest News", id: "Berita Terbaru" },
  "pasar-saham": { en: "Stock Market", id: "Pasar Saham" },
  komoditas: { en: "Commodities", id: "Komoditas" },
} as const;

type CategorySlug = keyof typeof CATEGORY_LABELS;

const normalizeCategorySlug = (
  value: string | undefined,
): CategorySlug | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "semua") return "all";
  return normalized in CATEGORY_LABELS ? (normalized as CategorySlug) : null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string; kategori?: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, kategori, slug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const category = normalizeCategorySlug(kategori);
  if (!category) notFound();

  return buildIndonesiaMarketNewsMetadata({
    locale,
    slug,
    detailBasePath: `${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/${category}`,
  });
}

export default async function IndonesiaMarketNewsDetailPage({
  params,
}: {
  params: Promise<{ locale?: string; kategori?: string; slug: string }>;
}) {
  const { locale: rawLocale, kategori, slug } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";

  const category = normalizeCategorySlug(kategori);
  if (!category) notFound();

  // Normalize /.../news/semua/... -> /.../news/all/...
  if (kategori?.trim().toLowerCase() === "semua") {
    permanentRedirect(
      `/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/all/${slug}`,
    );
  }

  const detail = await fetchIndonesiaMarketNewsDetail(slug);
  if (!isValidIndonesiaMarketNewsArticle(detail.article)) {
    notFound();
  }

  const messages = getMessages(locale);
  const customMessages = {
    ...messages,
    header: {
      ...messages.header,
      activeNavKey: "home",
    },
  };

  const detailBasePath = `${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/${category}`;

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <Container className="py-8">
        <NewsArticleDetail
          slug={slug}
          locale={locale}
          initialData={{
            data: detail.article,
            latest: detail.latest,
            related: detail.related,
            imageBase: detail.imageBase,
          }}
          categorySlug={category}
          detailBasePath={detailBasePath}
          parentHref={`/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/all`}
          parentLabel={CATEGORY_LABELS.all[locale]}
          listingHref={`/${locale}/${detailBasePath}`}
          listingLabel={CATEGORY_LABELS[category][locale]}
        />
      </Container>
    </MarketPageTemplate>
  );
}
