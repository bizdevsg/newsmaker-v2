import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

type CalendarImpact = 1 | 2 | 3;

export type EconomicCalendarTimeFrame =
  | "today"
  | "this-week"
  | "previous-week"
  | "next-week";

export type EconomicCalendarItem = {
  key: string;
  date?: string;
  time: string;
  title: string;
  currency: string;
  countryCode: string;
  impact: CalendarImpact;
  previous: string;
  forecast: string;
  actual: string;
  details?: EconomicCalendarDetails;
};

export type EconomicCalendarHistoryItem = {
  date: string;
  previous?: string;
  forecast?: string;
  actual?: string;
};

export type EconomicCalendarDetails = {
  sources?: string;
  measures?: string;
  usualEffect?: string;
  frequency?: string;
  nextRelease?: string;
  notes?: string;
  whyCare?: string;
  history?: EconomicCalendarHistoryItem[];
};

const DEFAULT_TODAY_URL =
  "https://portalnews.newsmaker.id/api/v1/newsmaker/kalender-ekonomi/today";

const DEFAULT_THIS_WEEK_URL =
  "https://portalnews.newsmaker.id/api/v1/newsmaker/kalender-ekonomi/this-week";

const DEFAULT_PREVIOUS_WEEK_URL =
  "https://portalnews.newsmaker.id/api/v1/newsmaker/kalender-ekonomi/previous-week";

const DEFAULT_NEXT_WEEK_URL =
  "https://portalnews.newsmaker.id/api/v1/newsmaker/kalender-ekonomi/next-week";

const resolveEconomicCalendarUrl = (timeFrame: EconomicCalendarTimeFrame) => {
  const byEnv: Partial<Record<EconomicCalendarTimeFrame, string | undefined>> = {
    today: process.env.PORTALNEWS_ECONOMIC_CALENDAR_TODAY_URL,
    "this-week": process.env.PORTALNEWS_ECONOMIC_CALENDAR_THIS_WEEK_URL,
    "previous-week": process.env.PORTALNEWS_ECONOMIC_CALENDAR_PREVIOUS_WEEK_URL,
    "next-week": process.env.PORTALNEWS_ECONOMIC_CALENDAR_NEXT_WEEK_URL,
  };

  const byDefault: Record<EconomicCalendarTimeFrame, string> = {
    today: DEFAULT_TODAY_URL,
    "this-week": DEFAULT_THIS_WEEK_URL,
    "previous-week": DEFAULT_PREVIOUS_WEEK_URL,
    "next-week": DEFAULT_NEXT_WEEK_URL,
  };

  const envUrl = byEnv[timeFrame];
  const resolved =
    typeof envUrl === "string" && envUrl.trim() ? envUrl : byDefault[timeFrame];
  return resolved.replace(/\/$/, "");
};

const resolveToken = () => {
  const candidates = [
    process.env.PORTALNEWS_ECONOMIC_CALENDAR_TOKEN,
    process.env.PORTALNEWS_TOKEN,
    process.env.PORTALNEWS_PASAR_INDONESIA_TOKEN,
    process.env.PORTALNEWS_REGULATORY_WATCH_TOKEN,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  return "";
};

const TOKEN = resolveToken();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const alpha3ToAlpha2: Record<string, string> = {
  USA: "us",
  USD: "us",
  JPN: "jp",
  JPY: "jp",
  IDN: "id",
  IDR: "id",
  CHN: "cn",
  CNY: "cn",
  HKG: "hk",
  HKD: "hk",
  GBR: "gb",
  GBP: "gb",
  CHE: "ch",
  CHF: "ch",
  AUS: "au",
  AUD: "au",
  DEU: "de",
  EUR: "eu",
  FRA: "fr",
  ITA: "it",
  ESP: "es",
  CAN: "ca",
  CAD: "ca",
};

const normalizeCountryCode = (value: unknown) => {
  const raw = normalizeText(value).toUpperCase();
  if (!raw) return "";
  if (raw.length === 2) return raw.toLowerCase();
  const mapped = alpha3ToAlpha2[raw];
  return mapped ?? "";
};

const getFirstArray = (value: unknown): unknown[] | null => {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return null;
  const candidates = [value.data, value.items, value.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return null;
};

const parseImpact = (value: unknown): CalendarImpact => {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 3) return 3;
    if (value >= 2) return 2;
    return 1;
  }
  const text = normalizeText(value).toLowerCase();
  if (text === "high") return 3;
  if (text === "medium") return 2;
  if (text === "low") return 1;
  return 1;
};

const getNested = (value: unknown, keys: string[]) => {
  if (!isRecord(value)) return undefined;
  for (const key of keys) {
    const candidate = value[key];
    if (candidate !== undefined && candidate !== null) return candidate;
  }
  return undefined;
};

const toHistoryItem = (value: unknown): EconomicCalendarHistoryItem | null => {
  if (!isRecord(value)) return null;
  const date =
    normalizeText(value.date) ||
    normalizeText(value.tanggal) ||
    normalizeText(value.time) ||
    normalizeText(value.waktu) ||
    "";
  if (!date) return null;

  const previous =
    normalizeText(value.previous) ||
    normalizeText(value.prev) ||
    normalizeText(value.previous_value) ||
    "";
  const forecast =
    normalizeText(value.forecast) ||
    normalizeText(value.consensus) ||
    normalizeText(value.expected) ||
    "";
  const actual = normalizeText(value.actual) || normalizeText(value.act) || "";

  return {
    date,
    previous: previous || undefined,
    forecast: forecast || undefined,
    actual: actual || undefined,
  };
};

const toDetails = (value: unknown): EconomicCalendarDetails | undefined => {
  if (!isRecord(value)) return undefined;

  const details = (getNested(value, ["details", "detail", "meta"]) ??
    value) as unknown;

  const sources = normalizeText(
    getNested(details, ["sources", "source", "sumber"]),
  );
  const measures = normalizeText(
    getNested(details, ["measures", "measure", "measuring", "ukuran"]),
  );
  const usualEffect = normalizeText(
    getNested(details, [
      "usualEffect",
      "usual_effect",
      "effect",
      "efek",
      "usual_effects",
    ]),
  );
  const frequency = normalizeText(
    getNested(details, ["frequency", "freq", "frekuensi"]),
  );
  const nextRelease = normalizeText(
    getNested(details, ["nextRelease", "next_release", "nextReleased"]),
  );
  const notes = normalizeText(getNested(details, ["notes", "note", "catatan"]));
  const whyCare = normalizeText(
    getNested(details, ["whyCare", "why_care", "why_traders_care", "whyCareText"]),
  );

  const historyRaw =
    getNested(details, ["history", "riwayat", "histories"]) ??
    getNested(value, ["history", "riwayat"]);
  const historyList = Array.isArray(historyRaw)
    ? historyRaw.map(toHistoryItem).filter((item): item is EconomicCalendarHistoryItem => item !== null)
    : undefined;

  const resolved: EconomicCalendarDetails = {
    sources: sources || undefined,
    measures: measures || undefined,
    usualEffect: usualEffect || undefined,
    frequency: frequency || undefined,
    nextRelease: nextRelease || undefined,
    notes: notes || undefined,
    whyCare: whyCare || undefined,
    history: historyList?.length ? historyList : undefined,
  };

  const hasAny =
    Boolean(resolved.sources) ||
    Boolean(resolved.measures) ||
    Boolean(resolved.usualEffect) ||
    Boolean(resolved.frequency) ||
    Boolean(resolved.nextRelease) ||
    Boolean(resolved.notes) ||
    Boolean(resolved.whyCare) ||
    Boolean(resolved.history?.length);

  return hasAny ? resolved : undefined;
};

const toCalendarItem = (
  value: unknown,
  index: number,
): EconomicCalendarItem | null => {
  if (!isRecord(value)) return null;

  const date =
    normalizeText(value.date) ||
    normalizeText(value.tanggal) ||
    normalizeText(value.event_date) ||
    normalizeText(value.release_date) ||
    normalizeText(value.day) ||
    normalizeText(value.hari) ||
    "";

  const time =
    normalizeText(value.time) ||
    normalizeText(value.jam) ||
    normalizeText(value.serverTime) ||
    normalizeText(value.waktu) ||
    "--:--";

  const title =
    normalizeText(value.figures) ||
    normalizeText(value.title) ||
    normalizeText(value.event) ||
    normalizeText(value.name) ||
    normalizeText(value.judul) ||
    "Economic event";

  const currency =
    normalizeText(value.currency) ||
    normalizeText(value.ccy) ||
    normalizeText(value.mata_uang) ||
    normalizeText(value.country) ||
    normalizeText(value.symbol) ||
    "";

  const countryCode =
    normalizeCountryCode(value.country) ||
    normalizeCountryCode(value.currency) ||
    normalizeCountryCode(value.ccy) ||
    "";

  const impact = parseImpact(value.impact ?? value.level ?? value.priority);

  const previous =
    normalizeText(value.previous) ||
    normalizeText(value.prev) ||
    normalizeText(value.previous_value) ||
    "-";
  const forecast =
    normalizeText(value.forecast) ||
    normalizeText(value.consensus) ||
    normalizeText(value.expected) ||
    "-";
  const actual = normalizeText(value.actual) || normalizeText(value.act) || "-";

  const id =
    typeof value.id === "number" || typeof value.id === "string"
      ? String(value.id)
      : "";

  const details = toDetails(value);

  return {
    key: id || `${time}-${title}-${index}`,
    date: date || undefined,
    time,
    title,
    currency,
    countryCode,
    impact,
    previous,
    forecast,
    actual,
    details,
  };
};

export const fetchEconomicCalendarToday = async (
  maxItems: number,
): Promise<EconomicCalendarItem[] | null> => {
  return fetchEconomicCalendar("today", maxItems);
};

export const fetchEconomicCalendar = async (
  timeFrame: EconomicCalendarTimeFrame,
  maxItems: number,
): Promise<EconomicCalendarItem[] | null> => {
  try {
    const response = await fetchWithTimeout(
      resolveEconomicCalendarUrl(timeFrame),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(TOKEN
            ? {
                Authorization: `Bearer ${TOKEN}`,
                "X-API-TOKEN": TOKEN,
              }
            : {}),
        },
        cache: "no-store",
        next: { revalidate: 0 },
      },
      10_000,
    );

    if (!response.ok) return null;

    const payload = (await response.json().catch(() => null)) as unknown;
    const list = getFirstArray(payload);
    if (!list) return null;

    const mapped = list
      .map((item, index) => toCalendarItem(item, index))
      .filter((item): item is EconomicCalendarItem => item !== null);

    return mapped.slice(0, Math.max(1, maxItems));
  } catch {
    return null;
  }
};
