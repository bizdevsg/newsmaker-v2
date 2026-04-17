import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

export type VideoBriefingItem = {
  id?: number;
  title?: string;
  embed_code?: string;
  image_url?: string;
  backup_video_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

type VideoBriefingResponse = {
  data?: VideoBriefingItem[];
};

const buildVideoBriefingUrl = () => {
  const explicit =
    process.env.PORTALNEWS_VIDEO_BRIEFING_URL ??
    process.env.NEXT_PUBLIC_PORTALNEWS_VIDEO_BRIEFING_URL ??
    "";
  if (explicit) return explicit;

  const base =
    process.env.PORTALNEWS_NEWSMAKER_BASE_URL ??
    process.env.NEXT_PUBLIC_PORTALNEWS_NEWSMAKER_BASE_URL ??
    "";
  if (base) return `${base.replace(/\/+$/, "")}/video-briefing`;

  const legacyNewsListUrl =
    process.env.PORTALNEWS_API_URL ??
    process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ??
    "";

  const derivedBase = legacyNewsListUrl
    ? legacyNewsListUrl.replace(/\/berita(?:\/.*)?$/i, "")
    : "";

  return derivedBase ? `${derivedBase.replace(/\/+$/, "")}/video-briefing` : "";
};

const sortByNewest = (items: VideoBriefingItem[]) => {
  const parse = (value?: string) => {
    if (!value) return Number.NaN;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  return [...items].sort((a, b) => {
    const aTime = parse(a.updated_at ?? a.created_at);
    const bTime = parse(b.updated_at ?? b.created_at);
    const aMissing = Number.isNaN(aTime);
    const bMissing = Number.isNaN(bTime);
    if (aMissing && bMissing) return 0;
    if (aMissing) return 1;
    if (bMissing) return -1;
    return bTime - aTime;
  });
};

export async function fetchVideoBriefings(
  limit = 3,
): Promise<VideoBriefingItem[]> {
  try {
    const videoBriefingApi = buildVideoBriefingUrl();
    if (!videoBriefingApi) return [];

    const token =
      process.env.PORTALNEWS_TOKEN ??
      process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ??
      "";

    const response = await fetchWithTimeout(
      videoBriefingApi,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      },
      10_000,
    );
    if (!response.ok) return [];

    const json = (await response
      .json()
      .catch(() => null)) as VideoBriefingResponse | null;
    const items = Array.isArray(json?.data) ? json?.data : [];
    const unique: VideoBriefingItem[] = [];
    const seen = new Set<string>();
    for (const item of items) {
      const key = String(item?.id ?? "").trim();
      if (key) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      unique.push(item);
    }

    const sorted = sortByNewest(unique);
    const capped = sorted.slice(0, Math.max(0, limit));
    return capped;
  } catch {
    return [];
  }
}

export async function fetchLatestVideoBriefing(): Promise<VideoBriefingItem | null> {
  const items = await fetchVideoBriefings(1);
  return items[0] ?? null;
}
