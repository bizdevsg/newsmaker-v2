import {
  getPortalNewsCategoryKeys,
  normalizePortalNewsCategory,
  type PortalNewsItem,
} from "@/lib/portalnews";

export const INDONESIA_MARKET_NEWS_CATEGORY_SLUG = "global-economics";
export const INDONESIA_MARKET_NEWS_DETAIL_BASE_PATH = "indonesia-market/news";

export const INDONESIA_MARKET_ANALYSIS_CATEGORY_SLUG = "analisis-market";
export const INDONESIA_MARKET_ANALYSIS_DETAIL_BASE_PATH =
  "indonesia-market/analysis";

const hasCategoryKey = (item: PortalNewsItem, value: string) => {
  const normalizedValue = normalizePortalNewsCategory(value);

  return getPortalNewsCategoryKeys(item).some((key) => key === normalizedValue);
};

export const isIndonesiaMarketNewsArticle = (item: PortalNewsItem) =>
  hasCategoryKey(item, INDONESIA_MARKET_NEWS_CATEGORY_SLUG);

export const isIndonesiaMarketAnalysisArticle = (item: PortalNewsItem) =>
  item.type === "analisis" ||
  hasCategoryKey(item, INDONESIA_MARKET_ANALYSIS_CATEGORY_SLUG);
