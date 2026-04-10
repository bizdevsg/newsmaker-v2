import "server-only";

import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import type { RegulatoryWatchItem } from "@/lib/regulatory-watch";

type RegulatoryWatchPagination = {
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
  from?: number | null;
  to?: number | null;
  has_more_pages?: boolean;
  prev_page_url?: string | null;
  next_page_url?: string | null;
};

type RegulatoryWatchMeta = {
  pagination?: RegulatoryWatchPagination;
};

type RegulatoryWatchPayload = {
  status?: string;
  type?: string;
  data?: unknown;
  meta?: RegulatoryWatchMeta;
};

const DEFAULT_REGULATORY_WATCH_URL =
  "http://portalnews.newsmaker.test/api/v1/newsmaker/pasar-indonesia/regulasi-institusi";

const REGULATORY_WATCH_URL = (
  process.env.PORTALNEWS_REGULATORY_WATCH_URL ?? DEFAULT_REGULATORY_WATCH_URL
).replace(/\/$/, "");

const REGULATORY_WATCH_TOKEN =
  process.env.PORTALNEWS_REGULATORY_WATCH_TOKEN ??
  "NPLD3SC2N06VVZYKUY5CRHJUQE3HSJ";

const MAX_REGULATORY_WATCH_PAGES = 25;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

const normalizeItem = (value: unknown): RegulatoryWatchItem | null => {
  if (!isRecord(value)) return null;

  const author = value.author;
  const normalizedAuthor =
    typeof author === "string"
      ? author.trim() || undefined
      : isRecord(author)
        ? {
            id: typeof author.id === "number" ? author.id : undefined,
            name: normalizeText(author.name),
            email: normalizeText(author.email),
          }
        : undefined;

  return {
    id: typeof value.id === "number" ? value.id : undefined,
    slug: normalizeText(value.slug),
    image: typeof value.image === "string" ? value.image : null,
    image_url: typeof value.image_url === "string" ? value.image_url : null,
    title_id: normalizeText(value.title_id),
    title_en: normalizeText(value.title_en),
    content_id: normalizeText(value.content_id),
    content_en: normalizeText(value.content_en),
    category: normalizeText(value.category),
    category_label: normalizeText(value.category_label),
    source: normalizeText(value.source),
    author: normalizedAuthor,
    created_at: normalizeText(value.created_at),
    updated_at: normalizeText(value.updated_at),
  };
};

const normalizePayloadItems = (
  payload: RegulatoryWatchPayload | null,
): RegulatoryWatchItem[] => {
  const rawData = payload?.data;

  if (Array.isArray(rawData)) {
    return rawData
      .map((item) => normalizeItem(item))
      .filter((item): item is RegulatoryWatchItem => item !== null);
  }

  const single = normalizeItem(rawData);
  return single ? [single] : [];
};

const getTimestamp = (item: RegulatoryWatchItem) => {
  const value = item.updated_at ?? item.created_at;
  const timestamp = Date.parse(value ?? "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const resolveNextPageUrl = (payload: RegulatoryWatchPayload | null) => {
  const pagination = payload?.meta?.pagination;
  if (!pagination?.has_more_pages) return null;

  const rawNext = pagination.next_page_url;
  if (typeof rawNext !== "string") return null;
  const next = rawNext.trim();
  return next ? next : null;
};

const fetchPayload = async (url: string): Promise<RegulatoryWatchPayload | null> => {
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${REGULATORY_WATCH_TOKEN}`,
        },
        next: { revalidate: 60 },
      },
      10_000,
    );

    if (!response.ok) return null;

    const payload =
      (await response.json().catch(() => null)) as RegulatoryWatchPayload | null;

    if (payload?.status !== "success") return null;

    return payload;
  } catch {
    return null;
  }
};

export async function fetchRegulatoryWatchList() {
  const items: RegulatoryWatchItem[] = [];
  const seenKeys = new Set<string>();

  let nextUrl: string | null = REGULATORY_WATCH_URL;
  let pageCount = 0;

  while (nextUrl && pageCount < MAX_REGULATORY_WATCH_PAGES) {
    pageCount += 1;
    const payload = await fetchPayload(nextUrl);
    if (!payload) break;

    for (const item of normalizePayloadItems(payload)) {
      const key = item.slug?.trim() || (item.id !== undefined ? String(item.id) : "");
      if (!key) continue;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      items.push(item);
    }

    nextUrl = resolveNextPageUrl(payload);
  }

  items.sort((left, right) => getTimestamp(right) - getTimestamp(left));
  return items;
}

export async function fetchRegulatoryWatchDetail(slug: string) {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return null;

  const detailPayload = await fetchPayload(
    `${REGULATORY_WATCH_URL}/${encodeURIComponent(normalizedSlug)}`,
  );
  const detailItems = normalizePayloadItems(detailPayload);
  const exactMatch =
    detailItems.find((item) => item.slug === normalizedSlug) ?? detailItems[0];

  if (exactMatch) {
    return exactMatch;
  }

  const listItems = await fetchRegulatoryWatchList();
  return listItems.find((item) => item.slug === normalizedSlug) ?? null;
}
