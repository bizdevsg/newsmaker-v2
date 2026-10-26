import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

export type TikTokItem = {
  id: number;
  title: string | null;
  /** Relative path, e.g. uploads/tiktok/xxx.mp4 */
  video: string;
  /** Absolute mp4 URL, ready for <video src>. */
  video_url: string;
  created_at: string;
  updated_at: string;
};

type TikTokResponse = {
  status?: string;
  message?: string;
  /** Single latest video, or null when none has been uploaded yet. */
  data?: TikTokItem | null;
  generated_at?: string;
};

export const buildTikTokUrl = () => {
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

  return (
    process.env.PORTALNEWS_TIKTOK_URL ??
    process.env.NEXT_PUBLIC_PORTALNEWS_TIKTOK_URL ??
    (derivedNewsmakerBaseUrl ? `${derivedNewsmakerBaseUrl}/tiktok` : "")
  );
};

export async function fetchLatestTikTok(): Promise<TikTokItem | null> {
  try {
    const tiktokApi = buildTikTokUrl();
    if (!tiktokApi) return null;

    const token =
      process.env.PORTALNEWS_TOKEN ??
      process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ??
      "";

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
    const item = json?.data;
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    if (!item.video_url) return null;

    return item;
  } catch {
    return null;
  }
}
