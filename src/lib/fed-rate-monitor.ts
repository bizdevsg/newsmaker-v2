import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { getCachedValue } from "@/lib/server-cache";
import {
  computeMeetingProbabilities,
  shiftMonthKey,
  type ContractPrices,
  type TargetRange,
} from "@/lib/fed-rate-probabilities";

const FOMC_CALENDAR_URL =
  "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm";
const NY_FED_EFFR_URL =
  "https://markets.newyorkfed.org/api/rates/unsecured/effr/last/1.json";
const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const MAX_MEETINGS = 8;
const CACHE_TTL_SECONDS = 30 * 60;
const SCHEDULE_CACHE_TTL_SECONDS = 24 * 60 * 60;
const WEEK_MS = 7 * 24 * 60 * 60 * 1_000;

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
// CME month codes, January..December.
const CONTRACT_MONTH_CODES = "FGHJKMNQUVXZ";

export type FedRateMonitorRow = TargetRange & {
  current: number;
  previousDay: number | null;
  previousWeek: number | null;
};

export type FedRateMonitorMeeting = {
  /** Decision day, YYYY-MM-DD. */
  date: string;
  /** Decision time (2:00 PM ET) as an ISO UTC timestamp. */
  decisionAt: string;
  futurePrice: number | null;
  rows: FedRateMonitorRow[];
};

export type FedRateMonitorData = {
  currentTarget: TargetRange;
  meetings: FedRateMonitorMeeting[];
  /** Latest futures quote time, ISO UTC. */
  updatedAt: string | null;
};

type ContractQuote = {
  current: number;
  previousDay: number | null;
  previousWeek: number | null;
  time: number | null;
};

/** 2:00 PM America/New_York on the given day, as a UTC timestamp. */
const toDecisionTimestamp = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, 18));
  const zoneName =
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      timeZoneName: "shortOffset",
    })
      .formatToParts(guess)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT-5";
  const offsetHours = Number(zoneName.match(/GMT([+-]\d+)/)?.[1] ?? -5);
  return Date.UTC(year, month - 1, day, 14 - offsetHours);
};

/** Parses scheduled meetings (decision day) from the Fed's FOMC calendar page. */
export const parseFomcCalendar = (html: string) => {
  const dates: string[] = [];
  const sections = html.split(/<h4>\s*<a[^>]*>\s*(\d{4}) FOMC Meetings/i);

  for (let index = 1; index < sections.length; index += 2) {
    const year = Number(sections[index]);
    const body = sections[index + 1] ?? "";
    const entries = body.matchAll(
      /fomc-meeting__month[^>]*>\s*<strong>([^<]+)<\/strong>[\s\S]*?fomc-meeting__date[^>]*>([^<]+)</gi,
    );

    for (const [, rawMonth, rawDays] of entries) {
      // e.g. "27-28", "16-17*", "Apr/May" + "30-1"; skips notation votes and
      // unscheduled meetings.
      const days = rawDays.trim().replace(/\*$/, "").match(/^(\d{1,2})(?:-(\d{1,2}))?$/);
      if (!days) continue;

      const months = rawMonth.trim().toLowerCase().split("/");
      const startDay = Number(days[1]);
      const endDay = Number(days[2] ?? days[1]);
      const monthName = endDay < startDay ? months[months.length - 1] : months[0];
      const monthIndex = MONTH_NAMES.findIndex((name) => name.startsWith(monthName));
      if (monthIndex < 0) continue;

      dates.push(
        `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`,
      );
    }
  }

  return [...new Set(dates)].sort();
};

const fetchFomcDecisionDates = () =>
  getCachedValue("fed-rate-monitor:fomc-calendar", SCHEDULE_CACHE_TTL_SECONDS, async () => {
    const response = await fetchWithTimeout(
      FOMC_CALENDAR_URL,
      { headers: { "User-Agent": USER_AGENT }, cache: "no-store" },
      10_000,
    );
    if (!response.ok) throw new Error(`FOMC calendar: ${response.status}`);
    const dates = parseFomcCalendar(await response.text());
    if (!dates.length) throw new Error("FOMC calendar: no meetings parsed");
    return dates;
  });

const fetchCurrentTarget = async () => {
  const response = await fetchWithTimeout(
    NY_FED_EFFR_URL,
    { cache: "no-store" },
    10_000,
  );
  if (!response.ok) throw new Error(`NY Fed EFFR: ${response.status}`);
  const json = (await response.json()) as {
    refRates?: {
      percentRate?: number;
      targetRateFrom?: number;
      targetRateTo?: number;
    }[];
  };
  const latest = json.refRates?.[0];
  if (
    typeof latest?.targetRateFrom !== "number" ||
    typeof latest?.targetRateTo !== "number"
  ) {
    throw new Error("NY Fed EFFR: target range missing");
  }

  return {
    target: { lower: latest.targetRateFrom, upper: latest.targetRateTo },
    effectiveRate:
      typeof latest.percentRate === "number" ? latest.percentRate : null,
  };
};

const toContractSymbol = (monthKey: string) => {
  const [year, month] = monthKey.split("-");
  return `ZQ${CONTRACT_MONTH_CODES[Number(month) - 1]}${year.slice(2)}.CBT`;
};

const toEasternDay = (timestampMs: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(
    timestampMs,
  );

const fetchContractQuote = async (
  monthKey: string,
): Promise<ContractQuote | null> => {
  try {
    const response = await fetchWithTimeout(
      `${YAHOO_CHART_BASE_URL}/${encodeURIComponent(toContractSymbol(monthKey))}?range=1mo&interval=1d`,
      { headers: { "User-Agent": USER_AGENT }, cache: "no-store" },
      10_000,
    );
    if (!response.ok) return null;

    const json = (await response.json()) as {
      chart?: {
        result?: {
          meta?: { regularMarketPrice?: number; regularMarketTime?: number };
          timestamp?: number[];
          indicators?: { quote?: { close?: (number | null)[] }[] };
        }[];
      };
    };
    const result = json.chart?.result?.[0];
    const current = result?.meta?.regularMarketPrice;
    if (typeof current !== "number") return null;

    const quoteTime = result?.meta?.regularMarketTime
      ? result.meta.regularMarketTime * 1_000
      : null;
    const closes = result?.indicators?.quote?.[0]?.close ?? [];
    const bars = (result?.timestamp ?? [])
      .map((seconds, index) => ({ time: seconds * 1_000, close: closes[index] }))
      .filter((bar): bar is { time: number; close: number } =>
        typeof bar.close === "number",
      );

    const referenceTime = quoteTime ?? bars[bars.length - 1]?.time ?? null;
    const referenceDay =
      referenceTime !== null ? toEasternDay(referenceTime) : null;
    const previousDayBar = [...bars]
      .reverse()
      .find((bar) => referenceDay !== null && toEasternDay(bar.time) < referenceDay);
    const previousWeekBar = [...bars]
      .reverse()
      .find((bar) => referenceTime !== null && bar.time <= referenceTime - WEEK_MS);

    return {
      current,
      previousDay: previousDayBar?.close ?? null,
      previousWeek: previousWeekBar?.close ?? null,
      time: quoteTime,
    };
  } catch {
    return null;
  }
};

const pickPrices = (
  quotes: Record<string, ContractQuote | null>,
  field: "current" | "previousDay" | "previousWeek",
): ContractPrices =>
  Object.fromEntries(
    Object.entries(quotes).map(([key, quote]) => [key, quote?.[field] ?? null]),
  );

const loadFedRateMonitor = async (): Promise<FedRateMonitorData> => {
  const [allDates, { target, effectiveRate }] = await Promise.all([
    fetchFomcDecisionDates(),
    fetchCurrentTarget(),
  ]);

  const now = Date.now();
  const meetingDates = allDates
    .filter((date) => toDecisionTimestamp(date) > now)
    .slice(0, MAX_MEETINGS);
  if (!meetingDates.length) throw new Error("No upcoming FOMC meetings");

  // Meeting months plus their neighbours, which serve as rate anchors.
  const monthKeys = new Set<string>();
  for (const date of meetingDates) {
    const key = date.slice(0, 7);
    monthKeys.add(shiftMonthKey(key, -1));
    monthKeys.add(key);
    monthKeys.add(shiftMonthKey(key, 1));
  }
  const keys = [...monthKeys];
  const quoteList = await Promise.all(keys.map(fetchContractQuote));
  const quotes = Object.fromEntries(
    keys.map((key, index) => [key, quoteList[index]]),
  );

  const compute = (field: "current" | "previousDay" | "previousWeek") =>
    computeMeetingProbabilities(
      meetingDates,
      pickPrices(quotes, field),
      target,
      effectiveRate,
    );
  const current = compute("current");
  if (!current.length) throw new Error("Fed funds futures unavailable");
  const previousDay = compute("previousDay");
  const previousWeek = compute("previousWeek");

  const probabilityAt = (
    list: typeof current,
    index: number,
    lower: number,
  ) => {
    // A missing earlier quote truncates the chain; report "-" rather than 0.
    const meeting = list[index];
    if (!meeting) return null;
    return meeting.buckets.find((bucket) => bucket.lower === lower)?.probability ?? 0;
  };

  const meetings = current.map((meeting, index) => ({
    date: meeting.date,
    decisionAt: new Date(toDecisionTimestamp(meeting.date)).toISOString(),
    futurePrice: quotes[meeting.date.slice(0, 7)]?.current ?? null,
    rows: meeting.buckets.map((bucket) => ({
      lower: bucket.lower,
      upper: bucket.upper,
      current: bucket.probability,
      previousDay: probabilityAt(previousDay, index, bucket.lower),
      previousWeek: probabilityAt(previousWeek, index, bucket.lower),
    })),
  }));

  const quoteTimes = quoteList
    .map((quote) => quote?.time ?? null)
    .filter((time): time is number => time !== null);

  return {
    currentTarget: target,
    meetings,
    updatedAt: quoteTimes.length
      ? new Date(Math.max(...quoteTimes)).toISOString()
      : null,
  };
};

export async function fetchFedRateMonitor(): Promise<FedRateMonitorData | null> {
  try {
    return await getCachedValue(
      "fed-rate-monitor:data",
      CACHE_TTL_SECONDS,
      loadFedRateMonitor,
    );
  } catch {
    return null;
  }
}
