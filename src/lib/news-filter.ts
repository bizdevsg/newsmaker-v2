import type { PortalNewsItem } from "@/lib/portalnews";
import {
  getPortalNewsCategoryKeys,
  normalizePortalNewsCategory,
} from "@/lib/portalnews";

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

export const itemMatchesTerms = (item: PortalNewsItem, terms: string[]) => {
  const normalizedTerms = terms
    .map((term) => normalizePortalNewsCategory(term))
    .filter(Boolean);

  if (!normalizedTerms.length) return true;

  const categoryKeys = new Set(getPortalNewsCategoryKeys(item));
  const haystack = resolveHaystack(item);

  return normalizedTerms.some((term) => {
    if (!term) return false;
    if (categoryKeys.has(term)) return true;
    for (const key of categoryKeys) {
      if (key.includes(term) || term.includes(key)) return true;
    }
    return haystack.includes(term);
  });
};

export const filterItemsByTerms = (items: PortalNewsItem[], terms: string[]) =>
  items.filter((item) => itemMatchesTerms(item, terms));

