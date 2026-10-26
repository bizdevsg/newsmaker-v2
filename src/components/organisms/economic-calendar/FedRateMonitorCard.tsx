"use client";

import React from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import type {
  FedRateMonitorData,
  FedRateMonitorMeeting,
} from "@/lib/fed-rate-monitor";
import type { Locale } from "@/locales";

// Buckets below this in every column are noise from the futures math.
const MIN_VISIBLE_PROBABILITY = 0.0005;

const formatPercent = (value: number | null) =>
  value === null ? "-" : `${(value * 100).toFixed(1)}%`;

const formatRange = (lower: number, upper: number) =>
  `${lower.toFixed(2)} - ${upper.toFixed(2)}`;

const formatMeetingDate = (date: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));

const formatDateTime = (iso: string, locale: Locale, timeZone: string) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    timeZone,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

function useCountdown(targetIso: string | null) {
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!targetIso || now === null) return null;
  const totalMinutes = Math.max(
    0,
    Math.floor((Date.parse(targetIso) - now) / 60_000),
  );
  const totalDays = Math.floor(totalMinutes / (60 * 24));
  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
    hours: Math.floor(totalMinutes / 60) % 24,
    minutes: totalMinutes % 60,
  };
}

function Countdown({
  meeting,
  locale,
}: {
  meeting: FedRateMonitorMeeting;
  locale: Locale;
}) {
  const countdown = useCountdown(meeting.decisionAt);
  const units = [
    { label: locale === "en" ? "Weeks" : "Minggu", value: countdown?.weeks },
    { label: locale === "en" ? "Days" : "Hari", value: countdown?.days },
    { label: locale === "en" ? "Hours" : "Jam", value: countdown?.hours },
    { label: locale === "en" ? "Minutes" : "Menit", value: countdown?.minutes },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-center">
      <p className="text-sm text-slate-700">
        {locale === "en"
          ? "Fed Interest Rate Decision"
          : "Keputusan Suku Bunga The Fed"}{" "}
        <span className="font-semibold text-slate-900">
          {formatDateTime(meeting.decisionAt, locale, "America/New_York")} ET
        </span>
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        {formatDateTime(meeting.decisionAt, locale, "Asia/Jakarta")} WIB
      </p>
      <div className="mt-3 flex items-center justify-center divide-x divide-slate-300">
        {units.map((unit) => (
          <div key={unit.label} className="min-w-16 px-3 sm:min-w-20">
            <p className="text-2xl font-bold tabular-nums text-slate-900">
              {unit.value ?? "-"}
            </p>
            <p className="text-xs text-slate-500">{unit.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeetingPanel({
  meeting,
  locale,
  updatedAt,
  open,
  onToggle,
}: {
  meeting: FedRateMonitorMeeting;
  locale: Locale;
  updatedAt: string | null;
  open: boolean;
  onToggle: () => void;
}) {
  const rows = meeting.rows.filter((row) =>
    [row.current, row.previousDay, row.previousWeek].some(
      (value) => value !== null && value >= MIN_VISIBLE_PROBABILITY,
    ),
  );
  const topProbability = Math.max(...rows.map((row) => row.current), 0);
  const panelId = `fed-meeting-${meeting.date}`;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left text-base font-bold text-slate-900 transition hover:bg-slate-100"
      >
        {formatMeetingDate(meeting.date, locale)}
        <i
          className={`fa-solid fa-chevron-down text-xs text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        ></i>
      </button>

      {open ? (
        <div id={panelId} className="space-y-4 border-t border-slate-200 p-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-slate-500">
              {locale === "en" ? "Meeting Time:" : "Waktu Meeting:"}
            </dt>
            <dd className="font-semibold text-slate-900">
              {formatDateTime(meeting.decisionAt, locale, "America/New_York")} ET
            </dd>
            <dt className="text-slate-500">Future Price:</dt>
            <dd className="font-semibold tabular-nums text-slate-900">
              {meeting.futurePrice?.toFixed(3) ?? "-"}
            </dd>
          </dl>

          <div className="space-y-2 border-y border-slate-200 py-4">
            {rows.map((row) => {
              const isTop = row.current === topProbability;
              return (
                <div
                  key={row.lower}
                  className="grid grid-cols-[88px_1fr] items-center gap-3 text-xs"
                >
                  <span className="tabular-nums text-slate-700">
                    {formatRange(row.lower, row.upper)}
                  </span>
                  <div className="flex items-center gap-2 border-l border-slate-300 py-1 pl-0">
                    <div
                      className={`h-6 ${isTop ? "bg-[#5b84b1]" : "bg-slate-300"}`}
                      style={{ width: `${Math.max(row.current * 85, 0.5)}%` }}
                    />
                    <span className="tabular-nums text-slate-700">
                      {formatPercent(row.current)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-700">
                  <th scope="col" className="py-2 pr-2 text-left font-semibold">
                    Target Rate
                  </th>
                  <th scope="col" className="px-2 py-2 text-right font-semibold">
                    Current Probability%
                  </th>
                  <th scope="col" className="px-2 py-2 text-right font-semibold">
                    Previous Day Probability%
                  </th>
                  <th scope="col" className="py-2 pl-2 text-right font-semibold">
                    Previous Week Probability%
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {rows.map((row) => (
                  <tr key={row.lower} className="border-b border-slate-100">
                    <td className="py-2 pr-2 font-semibold tabular-nums text-slate-900">
                      {formatRange(row.lower, row.upper)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {formatPercent(row.current)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {formatPercent(row.previousDay)}
                    </td>
                    <td className="py-2 pl-2 text-right tabular-nums">
                      {formatPercent(row.previousWeek)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {updatedAt ? (
            <p className="text-right text-xs text-slate-500">
              {locale === "en" ? "Updated:" : "Diperbarui:"}{" "}
              {formatDateTime(updatedAt, locale, "America/New_York")} ET
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function FedRateMonitorCard({
  data,
  locale,
  className = "",
}: {
  data: FedRateMonitorData | null;
  locale: Locale;
  className?: string;
}) {
  const [openDate, setOpenDate] = React.useState<string | null>(
    data?.meetings[0]?.date ?? null,
  );
  const nextMeeting = data?.meetings[0] ?? null;

  return (
    <Card className={`flex flex-col ${className}`.trim()}>
      <SectionHeader title="Fed Rate Monitor" />

      <div className="space-y-4 p-4">
        {data && nextMeeting ? (
          <>
            <Countdown meeting={nextMeeting} locale={locale} />

            <p className="text-sm leading-relaxed text-slate-600">
              {locale === "en"
                ? "Probabilities are calculated automatically from CME 30-Day Fed Funds futures prices, which reflect market expectations for changes to the US interest rate at each upcoming FOMC meeting."
                : "Probabilitas dihitung otomatis dari harga CME 30-Day Fed Funds futures, yang mencerminkan ekspektasi pasar terhadap perubahan suku bunga AS di setiap meeting FOMC berikutnya."}{" "}
              {locale === "en" ? "Current target rate:" : "Suku bunga acuan saat ini:"}{" "}
              <span className="font-semibold text-slate-900">
                {formatRange(data.currentTarget.lower, data.currentTarget.upper)}%
              </span>
              .
            </p>

            <div className="space-y-3">
              {data.meetings.map((meeting) => (
                <MeetingPanel
                  key={meeting.date}
                  meeting={meeting}
                  locale={locale}
                  updatedAt={data.updatedAt}
                  open={openDate === meeting.date}
                  onToggle={() =>
                    setOpenDate((current) =>
                      current === meeting.date ? null : meeting.date,
                    )
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            {locale === "en"
              ? "Fed rate data is not available right now."
              : "Data Fed rate belum tersedia saat ini."}
          </p>
        )}
      </div>
    </Card>
  );
}
