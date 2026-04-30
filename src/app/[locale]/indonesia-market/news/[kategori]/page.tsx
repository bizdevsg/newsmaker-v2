import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { NewsCategoryList } from "@/components/organisms/NewsCategoryList";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";
import { INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH } from "@/lib/indonesia-market-sections";
import {
  fetchIndonesiaMarketNewsDetail,
  isValidIndonesiaMarketNewsArticle,
} from "@/lib/indonesia-market-news";
import { resolveIndonesiaMarketNewsCategorySlugFromItem } from "@/lib/indonesia-market-news-category";
import { Card } from "@/components/atoms/Card";

const CATEGORY_LABELS = {
  all: { en: "Latest News", id: "Berita Terbaru" },
  "makro-ekonomi": { en: "Macro Economy", id: "Makro Ekonomi" },
  "pasar-saham": { en: "Stock Market", id: "Pasar Saham" },
  "obligasi-sbn": { en: "Bonds & SBN", id: "Obligasi & SBN" },
  "rupiah-dan-valas": { en: "Rupiah & Forex", id: "Rupiah & Valas" },
  komoditas: { en: "Commodities", id: "Komoditas" },
  "korporasi-emiten": { en: "Corporate & Issuers", id: "Korporasi & Emiten" },
  "investasi-strategi": {
    en: "Investment & Strategy",
    id: "Investasi & Strategi",
  },
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
  params: Promise<{ locale?: string; kategori?: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, kategori } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";

  const category = normalizeCategorySlug(kategori);
  if (!category) {
    return {
      title: locale === "en" ? "Latest News" : "Berita Terbaru",
    };
  }

  return {
    title: CATEGORY_LABELS[category][locale],
  };
}

export default async function IndonesiaMarketNewsCategoryPage({
  params,
}: {
  params: Promise<{ locale?: string; kategori?: string }>;
}) {
  const { locale: rawLocale, kategori } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const category = normalizeCategorySlug(kategori);

  const messages = getMessages(locale);
  const customMessages = {
    ...messages,
    header: {
      ...messages.header,
      activeNavKey: "home",
    },
  };

  // /indonesia-market/news/[slug] legacy detail support:
  // If [kategori] isn't a known category, treat it as the article slug and redirect.
  if (!category) {
    const slug = String(kategori ?? "").trim();
    if (!slug) notFound();

    const detail = await fetchIndonesiaMarketNewsDetail(slug, {
      latestLimit: 1,
      relatedLimit: 1,
    });

    if (!isValidIndonesiaMarketNewsArticle(detail.article)) {
      notFound();
    }

    const resolvedCategory = resolveIndonesiaMarketNewsCategorySlugFromItem(
      detail.article,
    );
    permanentRedirect(
      `/${locale}/${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/${resolvedCategory}/${slug}`,
    );
  }

  const labelOverride = CATEGORY_LABELS[category][locale];
  const detailBasePath = `${INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH}/${category}`;
  const includeCategoryValues =
    category === "pasar-saham"
      ? [
          "makro-ekonomi",
          "saham",
          "pasar-saham",
          "obligasi-sbn",
          "rupiah-dan-valas",
          "korporasi-emiten",
          "investasi-strategi",
        ]
      : category === "komoditas"
        ? ["komoditas", "gold", "silver", "oil"]
        : undefined;
  const excludeCategoryValues =
    category === "pasar-saham" ? ["komoditas"] : undefined;

  // For the "all" list we pull from the dedicated Pasar Indonesia feed.
  const categorySlug =
    category === "all" || category === "pasar-saham" || category === "komoditas"
      ? "pasar-indonesia"
      : (category as string);

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <Card className="my-8">
        <NewsCategoryList
          categorySlug={categorySlug}
          locale={locale}
          messages={customMessages}
          labelOverride={labelOverride}
          detailBasePath={detailBasePath}
          includeCategoryValues={includeCategoryValues}
          excludeCategoryValues={excludeCategoryValues}
          parentHref={`/${locale}`}
          parentLabel={messages.hero.title}
          emptyLabel={
            locale === "en"
              ? `No ${labelOverride.toLowerCase()} is available yet.`
              : `Belum ada ${labelOverride.toLowerCase()}.`
          }
        />
      </Card>
    </MarketPageTemplate>
  );
}
