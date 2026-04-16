import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

export type TikTokItem = {
  id?: number;
  title?: string;
  embed_code?: string;
  backup_video_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

type TikTokResponse = {
  data?: TikTokItem[];
};

export async function fetchLatestTikTok(): Promise<TikTokItem | null> {
  try {
    const legacyNewsListUrl =
      process.env.PORTALNEWS_API_URL ??
      process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ??
      "";

    const derivedNewsmakerBaseUrl = legacyNewsListUrl
      ? legacyNewsListUrl.replace(
          /\/api\/v1\/berita(?:\/.*)?$/i,
          "/api/v1/newsmaker",
        )
      : "";

    const tiktokApi =
      process.env.PORTALNEWS_TIKTOK_URL ??
      process.env.NEXT_PUBLIC_PORTALNEWS_TIKTOK_URL ??
      (derivedNewsmakerBaseUrl ? `${derivedNewsmakerBaseUrl}/tiktok` : "");

    const token =
      process.env.PORTALNEWS_TOKEN ??
      process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ??
      "";

    if (!tiktokApi) return null;

    const response = await fetchWithTimeout(
      tiktokApi,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      },
      10_000,
    );
    if (!response.ok) return null;
    const json = (await response
      .json()
      .catch(() => null)) as TikTokResponse | null;
    const item = Array.isArray(json?.data) ? json?.data?.[0] : undefined;
    return item ?? null;
  } catch {
    return null;
  }
}

