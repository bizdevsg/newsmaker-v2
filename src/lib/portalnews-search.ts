import type { Locale } from "@/locales";

export type PortalNewsSearchResult = {
  type: "berita" | "analisis" | "regulasi-institusi";
  category: string;
  date: string;
  href: string;
  id: number | string;
  image: string | null;
  score: number;
  summary: string;
  title: string;
};

export const normalizeSearchQuery = (value?: string | string[] | null) =>
  String(Array.isArray(value) ? value.join(" ") : value ?? "")
    .replace(/\s+/g, " ")
    .trim();

export const buildSearchPath = (locale: Locale, query?: string | null) => {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return `/${locale}/search`;

  // Use query-string to avoid path-segment issues with reserved characters
  // (e.g. "AUD/USD") and to keep the URL stable under proxies/CDNs.
  return `/${locale}/search?q=${encodeURIComponent(normalizedQuery)}`;
};

export const getSearchQueryFromSegments = (segments?: string[]) =>
  normalizeSearchQuery(segments?.join(" "));
