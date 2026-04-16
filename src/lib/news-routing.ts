import type { Locale, Messages } from "@/locales";
import { itemMatchesTerms } from "@/lib/news-filter";
import {
  getPortalNewsCategoryKeys,
  normalizePortalNewsCategory,
  type PortalNewsItem,
} from "@/lib/portalnews";

export type NewsCategorySlug = "crypto" | "index" | "commodity" | "currencies";

export type NewsSubSlug =
  | "nikkei"
  | "hangseng"
  | "gold"
  | "silver"
  | "oil"
  | "eur-usd"
  | "usd-jpy"
  | "usd-chf"
  | "aud-usd"
  | "gbp-usd"
  | "us-dollar";

type SiteNavLabels = Messages["header"]["siteNav"];
type SiteNavLabelKey = keyof SiteNavLabels;

export type NewsSubConfig = {
  slug: NewsSubSlug;
  labelKey: SiteNavLabelKey;
  matchTerms: string[];
};

export type NewsCategoryConfig = {
  slug: NewsCategorySlug;
  labelKey: SiteNavLabelKey;
  matchTerms: string[];
  subs: NewsSubConfig[];
};

export const NEWS_NAV_CONFIG: NewsCategoryConfig[] = [
  {
    slug: "crypto",
    labelKey: "crypto",
    matchTerms: ["crypto", "kripto", "bitcoin", "btc", "ethereum", "eth"],
    subs: [],
  },
  {
    slug: "index",
    labelKey: "index",
    matchTerms: [
      "index",
      "indeks",
      "nikkei",
      "hangseng",
      "hang seng",
      "dow",
      "nasdaq",
      "s&p",
      "sp500",
      "s&p500",
    ],
    subs: [
      {
        slug: "nikkei",
        labelKey: "nikkei",
        matchTerms: ["nikkei", "japan", "jepang"],
      },
      {
        slug: "hangseng",
        labelKey: "hangseng",
        matchTerms: ["hangseng", "hang seng", "hong kong", "hk"],
      },
    ],
  },
  {
    slug: "commodity",
    labelKey: "commodity",
    matchTerms: [
      "commodity",
      "commodities",
      "komoditas",
      "gold",
      "emas",
      "silver",
      "perak",
      "oil",
      "minyak",
      "wti",
      "brent",
      "crude",
    ],
    subs: [
      { slug: "gold", labelKey: "gold", matchTerms: ["gold", "emas"] },
      { slug: "silver", labelKey: "silver", matchTerms: ["silver", "perak"] },
      {
        slug: "oil",
        labelKey: "oil",
        matchTerms: ["oil", "minyak", "wti", "brent", "crude"],
      },
    ],
  },
  {
    slug: "currencies",
    labelKey: "currencies",
    matchTerms: [
      "forex",
      "currency",
      "currencies",
      "mata uang",
      "eurusd",
      "eur/usd",
      "usdjpy",
      "usd/jpy",
      "usdchf",
      "usd/chf",
      "audusd",
      "aud/usd",
      "gbpusd",
      "gbp/usd",
      "us dollar",
      "dolar as",
      "dollar",
      "dolar",
    ],
    subs: [
      {
        slug: "eur-usd",
        labelKey: "eurUsd",
        matchTerms: ["eur-usd", "eurusd", "eur/usd"],
      },
      {
        slug: "usd-jpy",
        labelKey: "usdJpy",
        matchTerms: ["usd-jpy", "usdjpy", "usd/jpy"],
      },
      {
        slug: "usd-chf",
        labelKey: "usdChf",
        matchTerms: ["usd-chf", "usdchf", "usd/chf"],
      },
      {
        slug: "aud-usd",
        labelKey: "audUsd",
        matchTerms: ["aud-usd", "audusd", "aud/usd"],
      },
      {
        slug: "gbp-usd",
        labelKey: "gbpUsd",
        matchTerms: ["gbp-usd", "gbpusd", "gbp/usd"],
      },
      {
        slug: "us-dollar",
        labelKey: "usDollar",
        matchTerms: ["us-dollar", "us dollar", "dollar", "dolar as"],
      },
    ],
  },
];

const normalizeNewsSlug = (value?: string | null) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[-_]+/g, "-")
    .trim();

const categoryKeysMatchTerms = (
  item: Pick<PortalNewsItem, "kategori" | "main_category" | "sub_category">,
  terms: string[],
) => {
  const normalizedTerms = terms
    .map((term) => normalizePortalNewsCategory(term))
    .filter(Boolean);

  if (!normalizedTerms.length) return false;

  const categoryKeys = new Set(getPortalNewsCategoryKeys(item));

  return normalizedTerms.some((term) => {
    if (!term) return false;
    if (categoryKeys.has(term)) return true;
    for (const key of categoryKeys) {
      if (key.includes(term) || term.includes(key)) return true;
    }
    return false;
  });
};

const NEWS_CATEGORY_SLUGS = new Set(
  NEWS_NAV_CONFIG.map((item) => normalizeNewsSlug(item.slug)),
);

const NEWS_SUB_TO_CATEGORY = new Map(
  NEWS_NAV_CONFIG.flatMap((category) =>
    category.subs.map((sub) => [
      normalizeNewsSlug(sub.slug),
      category.slug,
    ] as const),
  ),
);

export const inferMarketNewsCategoryFromItem = (
  item: Pick<PortalNewsItem, "kategori" | "main_category" | "sub_category">,
): NewsCategorySlug | null => {
  const explicitSlugs = [
    item.main_category?.slug,
    item.sub_category?.slug,
    item.kategori?.slug,
  ]
    .map((value) => normalizeNewsSlug(value))
    .filter(Boolean);

  if (
    explicitSlugs.includes("market-analysis") ||
    explicitSlugs.includes("analisis-opinion") ||
    explicitSlugs.includes("gold-corner")
  ) {
    return null;
  }

  const candidates = [
    item.main_category?.slug,
    item.sub_category?.slug,
    item.kategori?.slug,
  ]
    .map((value) => normalizeNewsSlug(value))
    .filter(Boolean);

  for (const candidate of candidates) {
    if (NEWS_CATEGORY_SLUGS.has(candidate)) {
      return candidate as NewsCategorySlug;
    }

    const mapped = NEWS_SUB_TO_CATEGORY.get(candidate);
    if (mapped) return mapped;
  }

  for (const category of NEWS_NAV_CONFIG) {
    if (categoryKeysMatchTerms(item, category.matchTerms)) {
      return category.slug;
    }

    for (const sub of category.subs) {
      if (categoryKeysMatchTerms(item, sub.matchTerms)) {
        return category.slug;
      }
    }
  }

  return null;
};

export const buildMarketNewsDetailHrefForItem = (
  locale: Locale,
  item: Pick<PortalNewsItem, "slug" | "kategori" | "main_category" | "sub_category">,
) => {
  const slug = item.slug?.trim() || "";
  if (!slug) return null;

  const kategori = inferMarketNewsCategoryFromItem(item);
  if (!kategori) return null;

  if (kategori === "crypto") {
    return `/${locale}/news/crypto/${encodeURIComponent(slug)}`;
  }

  const sub =
    item.sub_category?.slug?.trim() ||
    item.main_category?.slug?.trim() ||
    item.kategori?.slug?.trim() ||
    "";

  if (!sub) return null;

  return `/${locale}/news/${encodeURIComponent(kategori)}/${encodeURIComponent(
    sub,
  )}/${encodeURIComponent(slug)}`;
};

export const getNewsCategoryConfig = (slug: string) =>
  NEWS_NAV_CONFIG.find((item) => item.slug === slug) ?? null;

export const getNewsSubConfig = (kategori: string, sub: string) =>
  getNewsCategoryConfig(kategori)?.subs.find((item) => item.slug === sub) ??
  null;

export const buildNewsCategoryHref = (locale: Locale, kategori: string) =>
  `/${locale}/news/${encodeURIComponent(kategori)}`;

export const buildNewsSubHref = (
  locale: Locale,
  kategori: string,
  sub: string,
) =>
  `/${locale}/news/${encodeURIComponent(kategori)}/${encodeURIComponent(sub)}`;

export const buildNewsDetailHref = (
  locale: Locale,
  kategori: string,
  slug: string,
  sub?: string | null,
) =>
  sub
    ? `/${locale}/news/${encodeURIComponent(kategori)}/${encodeURIComponent(
        sub,
      )}/${encodeURIComponent(slug)}`
    : `/${locale}/news/${encodeURIComponent(kategori)}/${encodeURIComponent(
        slug,
      )}`;

export type EconomicNewsSlug = "global-economy" | "fiscal-monetary";

export type EconomicNewsConfig = {
  slug: EconomicNewsSlug;
  labelKey: SiteNavLabelKey;
  matchTerms: string[];
};

export const ECONOMIC_NEWS_CONFIG: EconomicNewsConfig[] = [
  {
    slug: "global-economy",
    labelKey: "globalEconomy",
    matchTerms: [
      "global economy",
      "global-economy",
      "ekonomi global",
      "economy",
      "ekonomi",
      "gdp",
    ],
  },
  {
    slug: "fiscal-monetary",
    labelKey: "fiscalMoneter",
    matchTerms: [
      "fiscal",
      "fiskal",
      "monetary",
      "moneter",
      "rate",
      "interest rate",
      "suku bunga",
      "inflation",
      "inflasi",
      "fed",
      "central bank",
    ],
  },
];

const cleanText = (value?: string | null) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const resolveHaystack = (item: PortalNewsItem) => {
  const title =
    item.title_id?.trim() ||
    item.title_en?.trim() ||
    item.title?.trim() ||
    item.titles?.id?.trim() ||
    item.titles?.en?.trim() ||
    item.titles?.default?.trim() ||
    "";

  const content =
    item.content_id?.trim() ||
    item.content_en?.trim() ||
    item.content?.trim() ||
    item.contents?.id?.trim() ||
    item.contents?.en?.trim() ||
    item.contents?.default?.trim() ||
    "";

  return cleanText(`${title} ${content}`);
};

const scoreItemTerms = (item: PortalNewsItem, terms: string[]) => {
  const normalizedTerms = terms
    .map((term) => normalizePortalNewsCategory(term))
    .filter(Boolean);

  if (!normalizedTerms.length) return 0;

  const categoryKeys = getPortalNewsCategoryKeys(item);
  const categoryKeySet = new Set(categoryKeys);
  const haystack = resolveHaystack(item);

  return normalizedTerms.reduce((score, term) => {
    if (!term) return score;
    if (categoryKeySet.has(term)) return score + 3;

    for (const key of categoryKeys) {
      if (key.includes(term) || term.includes(key)) {
        return score + 2;
      }
    }

    return haystack.includes(term) ? score + 1 : score;
  }, 0);
};

export const getEconomicNewsConfig = (slug: string) =>
  ECONOMIC_NEWS_CONFIG.find((item) => item.slug === slug) ?? null;

export const buildEconomicNewsListHref = (locale: Locale, sub: string) =>
  `/${locale}/economic-news/${encodeURIComponent(sub)}`;

export const buildEconomicNewsDetailHref = (
  locale: Locale,
  sub: string,
  slug: string,
) =>
  `/${locale}/economic-news/${encodeURIComponent(sub)}/${encodeURIComponent(
    slug,
  )}`;

export type AnalysisSlug = "market-analysis" | "analisis-opinion" | "gold-corner";

export type AnalysisConfig = {
  slug: AnalysisSlug;
  labelKey: SiteNavLabelKey;
  matchTerms: string[];
};

export const ANALYSIS_CONFIG: AnalysisConfig[] = [
  {
    slug: "market-analysis",
    labelKey: "marketAnalysis",
    matchTerms: [
      "market analysis",
      "analisis pasar",
      "technical",
      "support",
      "resistance",
    ],
  },
  {
    slug: "analisis-opinion",
    labelKey: "analysisOpinion",
    matchTerms: ["opinion", "opini", "commentary"],
  },
  {
    slug: "gold-corner",
    labelKey: "goldCorner",
    matchTerms: ["gold corner", "gold-corner", "goldcorner"],
  },
];

export const getAnalysisConfig = (slug: string) =>
  ANALYSIS_CONFIG.find((item) => item.slug === slug) ?? null;

export const buildAnalysisListHref = (locale: Locale, sub: string) =>
  `/${locale}/analysis/${encodeURIComponent(sub)}`;

export const buildAnalysisDetailHref = (locale: Locale, sub: string, slug: string) =>
  `/${locale}/analysis/${encodeURIComponent(sub)}/${encodeURIComponent(slug)}`;

const normalizeRouteSlug = (value?: string | null) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[-_]+/g, "-")
    .trim();

export const buildGoldCornerListHref = (locale: Locale) =>
  `/${locale}/gold-corner`;

export const buildGoldCornerDetailHref = (locale: Locale, slug: string) =>
  `/${locale}/gold-corner/${encodeURIComponent(slug)}`;

export const isAnalysisPortalNewsItem = (item: PortalNewsItem) => {
  const type = item.type?.trim().toLowerCase() ?? "";
  if (type === "analisis" || type === "analysis" || type === "gold-corner") return true;

  const categorySlugs = [
    item.sub_category?.slug,
    item.main_category?.slug,
    item.kategori?.slug,
  ]
    .map((value) => normalizeRouteSlug(value))
    .filter(Boolean);

  if (categorySlugs.includes("market-analysis")) return true;
  if (categorySlugs.includes("analisis-opinion")) return true;
  if (categorySlugs.includes("gold-corner")) return true;

  return ANALYSIS_CONFIG.some((config) => itemMatchesTerms(item, config.matchTerms));
};

export const inferEconomicNewsCategoryFromItem = (
  item: PortalNewsItem,
): EconomicNewsSlug | null => {
  if (isAnalysisPortalNewsItem(item)) return null;
  if (inferMarketNewsCategoryFromItem(item) !== null) return null;

  let best: EconomicNewsSlug | null = null;
  let bestScore = 0;

  for (const config of ECONOMIC_NEWS_CONFIG) {
    const score = scoreItemTerms(item, config.matchTerms);
    if (score > bestScore) {
      bestScore = score;
      best = config.slug;
    }
  }

  return bestScore > 0 ? best : null;
};

export const inferAnalysisCategoryFromItem = (
  item: PortalNewsItem,
): AnalysisSlug | null => {
  if (inferMarketNewsCategoryFromItem(item) !== null) return null;
  if (!isAnalysisPortalNewsItem(item)) return null;

  const explicitCategory = [item.sub_category?.slug, item.main_category?.slug, item.kategori?.slug]
    .map((value) => normalizeRouteSlug(value))
    .filter(Boolean)
    .find((value) => ANALYSIS_CONFIG.some((config) => config.slug === value));

  if (explicitCategory) {
    return explicitCategory as AnalysisSlug;
  }

  let best: AnalysisSlug | null = null;
  let bestScore = 0;

  for (const config of ANALYSIS_CONFIG) {
    const score = scoreItemTerms(item, config.matchTerms);
    if (score > bestScore) {
      bestScore = score;
      best = config.slug;
    }
  }

  return bestScore > 0 ? best : null;
};

export const resolveNewsCategoryLabel = (messages: Messages, kategori: string) =>
  getNewsCategoryConfig(kategori)
    ? String(messages.header.siteNav[getNewsCategoryConfig(kategori)!.labelKey])
    : kategori;

export const resolveNewsSubLabel = (
  messages: Messages,
  kategori: string,
  sub: string,
) => {
  const config = getNewsSubConfig(kategori, sub);
  if (!config) return sub;
  return String(messages.header.siteNav[config.labelKey]);
};

export const resolveEconomicNewsLabel = (messages: Messages, sub: string) => {
  const config = getEconomicNewsConfig(sub);
  if (!config) return sub;
  return String(messages.header.siteNav[config.labelKey]);
};

export const resolveAnalysisLabel = (messages: Messages, sub: string) => {
  const config = getAnalysisConfig(sub);
  if (!config) return sub;
  return String(messages.header.siteNav[config.labelKey]);
};
