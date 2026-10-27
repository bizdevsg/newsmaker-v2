import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { getCachedValue } from "@/lib/server-cache";

const CACHE_TTL_SECONDS = 5 * 60;

const legacyNewsListUrl =
  process.env.PORTALNEWS_NEWS_LIST_URL ??
  process.env.PORTALNEWS_API_URL ??
  process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ??
  "";

const NEWSMAKER_BASE_URL =
  process.env.PORTALNEWS_NEWSMAKER_BASE_URL ??
  (legacyNewsListUrl
    ? legacyNewsListUrl.replace(
        /\/api\/v1\/(?:newsmaker\/)?berita(?:\/.*)?$/i,
        "/api/v1/newsmaker",
      )
    : "");

const FED_RATE_MONITOR_URL =
  process.env.PORTALNEWS_FED_RATE_MONITOR_URL ??
  (NEWSMAKER_BASE_URL
    ? `${NEWSMAKER_BASE_URL.replace(/\/$/, "")}/fed-rate-monitor`
    : "");

export type TargetRange = { lower: number; upper: number };

export type FedRateMonitorRow = TargetRange & {
  /** Probabilities as fractions (0-1). */
  current: number;
  previousDay: number | null;
  previousWeek: number | null;
};

export type FedRateMonitorMeeting = {
  /** Decision day, YYYY-MM-DD. */
  date: string;
  /** Decision time as an ISO UTC timestamp. */
  decisionAt: string;
  futurePrice: number | null;
  rows: FedRateMonitorRow[];
};

export type FedRateMonitorData = {
  currentTarget: TargetRange;
  meetings: FedRateMonitorMeeting[];
  /** "Updated" time from the data source, ISO UTC. */
  updatedAt: string | null;
};

type ApiRow = {
  target_lower?: number;
  target_upper?: number;
  current_probability?: number;
  previous_day_probability?: number | null;
  previous_week_probability?: number | null;
};

type ApiMeeting = {
  meeting_date?: string;
  decision_at?: string;
  future_price?: number | null;
  rows?: ApiRow[];
};

type ApiResponse = {
  data?: {
    current_target?: { lower?: number; upper?: number };
    updated_at?: string | null;
    meetings?: ApiMeeting[];
  } | null;
};

const toNumber = (value: unknown) => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
};

// The API sends percentages (89.7); the card works with fractions.
const toFraction = (value: unknown) => {
  const parsed = toNumber(value);
  return parsed === null ? null : parsed / 100;
};

const normalizeMeeting = (meeting: ApiMeeting): FedRateMonitorMeeting | null => {
  if (!meeting.meeting_date || !meeting.decision_at) return null;

  const rows = (meeting.rows ?? [])
    .map((row) => {
      const lower = toNumber(row.target_lower);
      const upper = toNumber(row.target_upper);
      const current = toFraction(row.current_probability);
      if (lower === null || upper === null || current === null) return null;
      return {
        lower,
        upper,
        current,
        previousDay: toFraction(row.previous_day_probability),
        previousWeek: toFraction(row.previous_week_probability),
      };
    })
    .filter((row): row is FedRateMonitorRow => row !== null)
    .sort((a, b) => a.lower - b.lower);
  if (!rows.length) return null;

  return {
    date: meeting.meeting_date,
    decisionAt: meeting.decision_at,
    futurePrice: toNumber(meeting.future_price),
    rows,
  };
};

const loadFedRateMonitor = async (): Promise<FedRateMonitorData | null> => {
  if (!FED_RATE_MONITOR_URL) return null;

  const token =
    process.env.PORTALNEWS_TOKEN ??
    process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ??
    "";

  const response = await fetchWithTimeout(
    FED_RATE_MONITOR_URL,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    },
    10_000,
  );
  if (!response.ok) throw new Error(`Fed rate monitor: HTTP ${response.status}`);

  const json = (await response.json()) as ApiResponse;
  const data = json.data;
  if (!data) return null;

  const lower = toNumber(data.current_target?.lower);
  const upper = toNumber(data.current_target?.upper);
  if (lower === null || upper === null) return null;

  const meetings = (data.meetings ?? [])
    .map(normalizeMeeting)
    .filter((meeting): meeting is FedRateMonitorMeeting => meeting !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!meetings.length) return null;

  return {
    currentTarget: { lower, upper },
    meetings,
    updatedAt: data.updated_at ?? null,
  };
};

export async function fetchFedRateMonitor(): Promise<FedRateMonitorData | null> {
  try {
    return await getCachedValue(
      "fed-rate-monitor:data",
      CACHE_TTL_SECONDS,
      loadFedRateMonitor,
    );
  } catch (error) {
    console.error("[fed-rate-monitor]", error);
    return null;
  }
}
