/**
 * Fed rate move probabilities implied by CME 30-Day Fed Funds futures (ZQ),
 * following the CME FedWatch methodology. Pure functions, no I/O.
 *
 * - A ZQ contract settles at 100 - (average EFFR over its month).
 * - For each FOMC meeting, the expected rate before (start) and after (end)
 *   the decision is solved from the meeting-month average, using an adjacent
 *   no-meeting month as an anchor when one is available.
 * - The expected move (end - start) is split into the two nearest 25 bp
 *   outcomes, and outcomes are chained across meetings.
 */

export const RATE_STEP = 0.25;

export type TargetRange = { lower: number; upper: number };

export type RateBucket = TargetRange & { probability: number };

export type MeetingProbabilities = {
  /** Decision day, YYYY-MM-DD. */
  date: string;
  buckets: RateBucket[];
};

/** Keyed by contract month, YYYY-MM. */
export type ContractPrices = Record<string, number | null | undefined>;

export const shiftMonthKey = (key: string, delta: number) => {
  const [year, month] = key.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
};

const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/** Splits a move of `steps` (in 25 bp units) into its two nearest outcomes. */
const applyMove = (distribution: Map<number, number>, steps: number) => {
  const low = Math.floor(steps);
  const upWeight = steps - low;
  const next = new Map<number, number>();

  for (const [state, probability] of distribution) {
    const add = (target: number, weight: number) => {
      if (weight <= 0) return;
      next.set(target, (next.get(target) ?? 0) + probability * weight);
    };
    add(state + low, 1 - upWeight);
    add(state + low + 1, upWeight);
  }

  return next;
};

const toBuckets = (
  distribution: Map<number, number>,
  current: TargetRange,
): RateBucket[] => {
  const merged = new Map<number, number>();
  for (const [steps, probability] of distribution) {
    // Rates can't go below the 0-0.25 range.
    const lower = Math.max(0, current.lower + steps * RATE_STEP);
    merged.set(lower, (merged.get(lower) ?? 0) + probability);
  }

  return [...merged.entries()]
    .sort(([a], [b]) => a - b)
    .map(([lower, probability]) => ({
      lower: round(lower),
      upper: round(lower + (current.upper - current.lower)),
      probability,
    }));
};

const round = (value: number) => Math.round(value * 1e4) / 1e4;

export function computeMeetingProbabilities(
  meetingDates: string[],
  prices: ContractPrices,
  current: TargetRange,
  /** Fallback starting rate (latest EFFR) when no futures anchor exists. */
  effectiveRate?: number | null,
): MeetingProbabilities[] {
  const meetingMonths = new Set(meetingDates.map((date) => date.slice(0, 7)));
  const impliedRate = (key: string) => {
    const price = prices[key];
    return typeof price === "number" && Number.isFinite(price)
      ? 100 - price
      : null;
  };

  const results: MeetingProbabilities[] = [];
  let distribution = new Map<number, number>([[0, 1]]);
  let previousEnd: number | null = null;

  for (const date of [...meetingDates].sort()) {
    const key = date.slice(0, 7);
    const average = impliedRate(key);
    if (average === null) break;

    const [year, month, day] = date.split("-").map(Number);
    const totalDays = daysInMonth(year, month);
    // A decision takes effect the day after the meeting.
    const beforeShare = day / totalDays;
    const afterShare = (totalDays - day) / totalDays;

    const nextKey = shiftMonthKey(key, 1);
    const previousKey = shiftMonthKey(key, -1);
    const nextAnchor = meetingMonths.has(nextKey) ? null : impliedRate(nextKey);
    const previousAnchor = meetingMonths.has(previousKey)
      ? null
      : impliedRate(previousKey);

    let start = previousEnd;
    if (start === null) {
      if (previousAnchor !== null) start = previousAnchor;
      else if (nextAnchor !== null && beforeShare > 0)
        start = (average - afterShare * nextAnchor) / beforeShare;
      else if (typeof effectiveRate === "number") start = effectiveRate;
      else break;
    }

    let end: number;
    if (nextAnchor !== null) end = nextAnchor;
    else if (afterShare > 0) end = (average - beforeShare * start) / afterShare;
    else break;

    distribution = applyMove(distribution, (end - start) / RATE_STEP);
    results.push({ date, buckets: toBuckets(distribution, current) });
    previousEnd = end;
  }

  return results;
}
