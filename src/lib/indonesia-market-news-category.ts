import { normalizePortalNewsCategory } from "@/lib/portalnews";

export type IndonesiaMarketNewsCategorySlug = "pasar-saham" | "komoditas";

const COMMODITY_HINTS = [
  "komoditas",
  "commodity",
  "commodities",
  "gold",
  "emas",
  "silver",
  "oil",
  "crude",
  "coal",
  "cpo",
  "nickel",
  "nikel",
].map((value) => normalizePortalNewsCategory(value));

const hasCommodityHint = (value: string) =>
  COMMODITY_HINTS.some((hint) => value === hint || value.includes(hint));

export const resolveIndonesiaMarketNewsCategorySlug = (
  values: Array<string | null | undefined>,
): IndonesiaMarketNewsCategorySlug => {
  const normalized = values
    .map((value) => normalizePortalNewsCategory(value))
    .filter(Boolean);

  return normalized.some(hasCommodityHint) ? "komoditas" : "pasar-saham";
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

