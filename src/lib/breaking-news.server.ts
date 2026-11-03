import "server-only";

import { buildPortalNewsImageUrl } from "@/lib/portalnews";
import { getCachedValue } from "@/lib/server-cache";
import type { Locale } from "@/locales";
import type {
  ActiveBreakingNews,
  BreakingNewsItem,
} from "@/types/breakingNews";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

const BASE_URL = (process.env.PORTALNEWS_NEWSMAKER_BASE_URL ?? "").replace(
  /\/$/,
  "",
);
const API_TOKEN = process.env.PORTALNEWS_TOKEN ?? "";

const LIST_URL = `${BASE_URL}/breaking-news`;
const TIMEOUT_MS = 5_000;
// Upstream dibatasi 60 request/menit, jadi semua pengunjung berbagi cache ini.
const LIST_CACHE_TTL_SECONDS = 30;
const DETAIL_CACHE_TTL_SECONDS = 60;

let lastGoodItems: BreakingNewsItem[] = [];

const requestUpstream = (url: string) =>
  fetchWithTimeout(
    url,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      cache: "no-store",
    },
    TIMEOUT_MS,
  );

// Gagal tetap di-cache lewat lastGoodItems supaya upstream tidak dihajar
// tiap request saat kena 429 atau down.
const loadList = async () => {
  if (!BASE_URL || !API_TOKEN) return lastGoodItems;

  try {
    const response = await requestUpstream(LIST_URL);
    if (!response.ok) {
      console.warn(`[breaking-news] list gagal: HTTP ${response.status}`);
      return lastGoodItems;
    }

    const payload = (await response.json()) as { data?: unknown };
    if (Array.isArray(payload.data)) {
      lastGoodItems = payload.data as BreakingNewsItem[];
    }
  } catch {
    console.warn("[breaking-news] list gagal: network/timeout");
  }

  return lastGoodItems;
};

const toJakartaDate = (value: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);

const normalizeTime = (value?: string | null) => {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : null;
};

// start_time/end_time cuma jam WIB tanpa tanggal, jadi tanggalnya dari created_at.
const resolveWindow = (item: BreakingNewsItem) => {
  const startTime = normalizeTime(item.start_time);
  const endTime = normalizeTime(item.end_time);
  const createdAt = new Date(item.created_at ?? "");
  if (!startTime || !endTime || Number.isNaN(createdAt.getTime())) return null;

  const date = toJakartaDate(createdAt);
  const start = Date.parse(`${date}T${startTime}:00+07:00`);
  let end = Date.parse(`${date}T${endTime}:00+07:00`);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  // Melewati tengah malam, misalnya 23:55 sampai 00:05.
  if (end <= start) end += 24 * 60 * 60 * 1_000;

  return { start, end, label: `${startTime}–${endTime} WIB` };
};

export const resolveBreakingNewsTitle = (
  item: BreakingNewsItem,
  locale: Locale,
) =>
  (locale === "en"
    ? item.title_en?.trim() || item.title_id?.trim()
    : item.title_id?.trim() || item.title_en?.trim()) || "Breaking News";

export const resolveBreakingNewsImage = (item: BreakingNewsItem) =>
  buildPortalNewsImageUrl(item.image_url || item.image)?.replace(/ /g, "%20") ??
  null;

export async function getActiveBreakingNews(
  locale: Locale,
): Promise<ActiveBreakingNews | null> {
  const items = await getCachedValue(
    "breaking-news:list",
    LIST_CACHE_TTL_SECONDS,
    loadList,
  );
  const now = Date.now();

  // Jam dihitung tiap request, jadi cache tidak bikin berita telat hilang.
  const active = items
    .flatMap((item) => {
      const slug = item.slug?.trim();
      const window = resolveWindow(item);
      if (!slug || !window) return [];
      return now >= window.start && now < window.end
        ? [{ item, slug, window }]
        : [];
    })
    .sort((left, right) => right.window.start - left.window.start)[0];

  if (!active) return null;

  return {
    key: String(active.item.id ?? active.slug),
    title: resolveBreakingNewsTitle(active.item, locale),
    image: resolveBreakingNewsImage(active.item),
    category: active.item.breaking_news_category?.name?.trim() ?? "",
    timeLabel: active.window.label,
    href: `/${locale}/breaking-news/${encodeURIComponent(active.slug)}`,
    remainingMs: active.window.end - now,
  };
}

export async function fetchBreakingNewsArticle(
  slug: string,
): Promise<BreakingNewsItem | null> {
  if (!BASE_URL || !API_TOKEN) return null;

  try {
    return await getCachedValue(
      `breaking-news:detail:${slug}`,
      DETAIL_CACHE_TTL_SECONDS,
      async () => {
        const response = await requestUpstream(
          `${LIST_URL}/show/${encodeURIComponent(slug)}`,
        );
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const payload = (await response.json()) as {
          data?: BreakingNewsItem;
        };
        return payload.data ?? null;
      },
    );
  } catch (error) {
    console.warn(
      `[breaking-news] detail gagal: ${error instanceof Error ? error.message : "unknown"}`,
    );
    return null;
  }
}
