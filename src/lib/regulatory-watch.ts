import type { Locale } from "@/locales";

export type RegulatoryWatchItem = {
  id?: number;
  slug?: string;
  image?: string | null;
  image_url?: string | null;
  title_id?: string;
  title_en?: string;
  content_id?: string;
  content_en?: string;
  category?: string;
  category_label?: string;
  source?: string;
  author?:
    | string
    | {
        id?: number;
        name?: string;
        email?: string;
      };
  created_at?: string;
  updated_at?: string;
};

const DEFAULT_REGULATORY_WATCH_ORIGIN = "https://portalnews.newsmaker.id";

const REGULATORY_WATCH_ORIGIN = (
  process.env.NEXT_PUBLIC_PORTALNEWS_REGULATORY_WATCH_ORIGIN ??
  process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE ??
  DEFAULT_REGULATORY_WATCH_ORIGIN
).replace(/\/$/, "");

export const resolveRegulatoryWatchTitle = (
  item: RegulatoryWatchItem,
  locale: Locale,
) =>
  locale === "en"
    ? (item.title_en ?? item.title_id ?? "Regulatory Update")
    : (item.title_id ?? item.title_en ?? "Pembaruan Regulasi");

export const resolveRegulatoryWatchContent = (
  item: RegulatoryWatchItem,
  locale: Locale,
) =>
  locale === "en"
    ? (item.content_en ?? item.content_id ?? "")
    : (item.content_id ?? item.content_en ?? "");

export const resolveRegulatoryWatchTag = (
  item: RegulatoryWatchItem,
  locale: Locale,
) =>
  item.category_label ??
  item.category ??
  (locale === "en" ? "Regulation" : "Regulasi");

export const resolveRegulatoryWatchImage = (item: RegulatoryWatchItem) => {
  const rawImage = item.image_url ?? item.image;
  if (!rawImage) return null;

  const normalizedImage = rawImage.trim();
  if (!normalizedImage) return null;
  if (/^https?:\/\//i.test(normalizedImage)) return normalizedImage;

  const normalizedPath = normalizedImage.startsWith("/")
    ? normalizedImage
    : `/${normalizedImage}`;

  return `${REGULATORY_WATCH_ORIGIN}${normalizedPath}`;
};

export const formatRegulatoryWatchDate = (
  value: string | undefined,
  locale: Locale,
) => {
  if (!value) return locale === "en" ? "N/A" : "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

export const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const summarizeText = (value: string, limit = 220) => {
  const text = stripHtml(value);
  if (!text) return "";
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}...`;
};
