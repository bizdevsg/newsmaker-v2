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

  return `/${locale}/search/${normalizedQuery
    .split(" ")
    .map(encodeURIComponent)
    .join("/")}`;
};

export const getSearchQueryFromSegments = (segments?: string[]) =>
  normalizeSearchQuery(segments?.join(" "));
