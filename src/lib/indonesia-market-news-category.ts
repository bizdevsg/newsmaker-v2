import { normalizePortalNewsCategory } from "@/lib/portalnews";
import type { Locale } from "@/locales";

export type IndonesiaMarketNewsCategorySlug =
  | "makro-ekonomi"
  | "pasar-saham"
  | "obligasi-sbn"
  | "rupiah-dan-valas"
  | "komoditas"
  | "korporasi-emiten"
  | "investasi-strategi";

export const INDONESIA_MARKET_NEWS_CATEGORY_LABELS: Record<
  IndonesiaMarketNewsCategorySlug,
  { en: string; id: string }
> = {
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
};

type CategoryRule = {
  slug: IndonesiaMarketNewsCategorySlug;
  aliases: string[];
};

const CATEGORY_RULES: CategoryRule[] = [
  {
    slug: "makro-ekonomi",
    aliases: [
      "makro ekonomi",
      "macro economy",
      "global economy",
      "global economics",
      "ekonomi global",
      "fiscal moneter",
      "fiscal monetary",
      "moneter",
      "fiskal",
    ],
  },
  {
    slug: "pasar-saham",
    aliases: [
      "pasar saham",
      "saham",
      "stock market",
      "stock",
      "stocks",
      "ihsg",
      "idx",
      "equity",
      "equities",
    ],
  },
  {
    slug: "obligasi-sbn",
    aliases: [
      "obligasi sbn",
      "obligasi",
      "sbn",
      "bond",
      "bonds",
      "yield",
      "imbal hasil",
    ],
  },
  {
    slug: "rupiah-dan-valas",
    aliases: [
      "rupiah dan valas",
      "rupiah",
      "valas",
      "forex",
      "currency",
      "currencies",
      "fx",
      "us dollar",
      "dollar as",
      "dolar as",
      "usd index",
      "eur usd",
      "eurusd",
      "usd jpy",
      "usdjpy",
      "usd chf",
      "usdchf",
      "aud usd",
      "audusd",
      "gbp usd",
      "gbpusd",
    ],
  },
  {
    slug: "komoditas",
    aliases: [
      "komoditas",
      "commodity",
      "commodities",
      "gold",
      "emas",
      "silver",
      "perak",
      "oil",
      "minyak",
      "crude",
      "coal",
      "cpo",
      "nickel",
      "nikel",
      "xauusd",
      "xagusd",
    ],
  },
  {
    slug: "korporasi-emiten",
    aliases: [
      "korporasi emiten",
      "korporasi",
      "emiten",
      "corporate",
      "issuer",
      "issuers",
      "dividen",
      "ipo",
      "laba",
      "earnings",
    ],
  },
  {
    slug: "investasi-strategi",
    aliases: [
      "investasi strategi",
      "investasi",
      "strategi",
      "investment",
      "strategy",
      "analisis market",
      "market analysis",
      "market outlook",
      "outlook",
    ],
  },
];

const NORMALIZED_CATEGORY_RULES = CATEGORY_RULES.map((rule) => ({
  slug: rule.slug,
  aliases: rule.aliases.map((value) => normalizePortalNewsCategory(value)),
}));

export const resolveIndonesiaMarketNewsCategorySlug = (
  values: Array<string | null | undefined>,
): IndonesiaMarketNewsCategorySlug => {
  const normalized = values
    .map((value) => normalizePortalNewsCategory(value))
    .filter(Boolean);

  for (const rule of NORMALIZED_CATEGORY_RULES) {
    if (
      normalized.some((value) =>
        rule.aliases.some(
          (alias) =>
            value === alias || value.includes(alias) || alias.includes(value),
        ),
      )
    ) {
      return rule.slug;
    }
  }

  return "pasar-saham";
};

type CategoryLike = {
  slug?: string | null;
  name?: string | null;
};

type IndonesiaMarketNewsCategorySource = {
  category?: string | null;
  category_label?: string | null;
  title?: string | null;
  title_id?: string | null;
  title_en?: string | null;
  content?: string | null;
  content_id?: string | null;
  content_en?: string | null;
  kategori?: CategoryLike | null;
  main_category?: CategoryLike | null;
  sub_category?: CategoryLike | null;
};

export const resolveIndonesiaMarketNewsCategorySlugFromItem = (
  item: IndonesiaMarketNewsCategorySource | null | undefined,
): IndonesiaMarketNewsCategorySlug => {
  if (!item) return "pasar-saham";

  return resolveIndonesiaMarketNewsCategorySlug([
    item.category,
    item.category_label,
    item.kategori?.slug,
    item.kategori?.name,
    item.main_category?.slug,
    item.main_category?.name,
    item.sub_category?.slug,
    item.sub_category?.name,
    item.title,
    item.title_id,
    item.title_en,
    item.content,
    item.content_id,
    item.content_en,
  ]);
};

export const getIndonesiaMarketNewsCategoryLabel = (
  slug: IndonesiaMarketNewsCategorySlug,
  locale: Locale,
) => INDONESIA_MARKET_NEWS_CATEGORY_LABELS[slug][locale];

export const resolveIndonesiaMarketNewsCategoryLabelFromItem = (
  item: IndonesiaMarketNewsCategorySource | null | undefined,
  locale: Locale,
) =>
  getIndonesiaMarketNewsCategoryLabel(
    resolveIndonesiaMarketNewsCategorySlugFromItem(item),
    locale,
  );
