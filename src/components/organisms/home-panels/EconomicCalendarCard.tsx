import React from "react";
import Link from "next/link";
import type { Locale, Messages } from "@/locales";
import type { EconomicCalendarItem } from "@/lib/economic-calendar";
import { fetchEconomicCalendarToday } from "@/lib/economic-calendar";
import { Card } from "../../atoms/Card";
import { SectionHeader } from "../../molecules/SectionHeader";

type EconomicCalendarCardProps = {
  locale?: Locale;
  messages?: Messages;
  href?: string;
  title?: string;
  viewAllLabel?: string;
  items?: EconomicCalendarItem[];
  maxItems?: number;
};

type TooltipLabels = {
  noDetails: string;
  sources: string;
  measures: string;
  usualEffect: string;
  frequency: string;
  nextRelease: string;
  notes: string;
  whyCare: string;
};

const DEFAULT_ITEMS: EconomicCalendarItem[] = [
  {
    key: "api-1",
    time: "03:30",
    title: "API Weekly Statistical Bulletin",
    currency: "USD",
    countryCode: "us",
    impact: 1,
    previous: "-",
    forecast: "-",
    actual: "-",
  },
  {
    key: "api-2",
    time: "03:30",
    title: "API Weekly Statistical Bulletin",
    currency: "USD",
    countryCode: "us",
    impact: 3,
    previous: "-",
    forecast: "-",
    actual: "-",
  },
  {
    key: "api-3",
    time: "03:30",
    title: "API Weekly Statistical Bulletin",
    currency: "USD",
    countryCode: "us",
    impact: 2,
    previous: "-",
    forecast: "-",
    actual: "-",
  },
  {
    key: "api-4",
    time: "03:30",
    title: "API Weekly Statistical Bulletin",
    currency: "USD",
    countryCode: "us",
    impact: 1,
    previous: "-",
    forecast: "-",
    actual: "-",
  },
];

const formatTodayLabel = (locale: Locale) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

function ImpactStars({ value }: { value: EconomicCalendarItem["impact"] }) {
  const max = 3;

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, index) => {
        const active = index < value;
        const toneClass = active
          ? value === 3
            ? "text-red-600"
            : value === 2
              ? "text-amber-400"
              : "text-green-500"
          : "text-slate-200";

        return (
          <i
            key={index}
            className={`fa-solid fa-star text-[10px] ${toneClass}`}
            aria-hidden="true"
          />
        );
      })}
    </span>
  );
}

function CalendarRow({
  item,
  locale,
  labels,
  tooltipLabels,
}: {
  item: EconomicCalendarItem;
  locale: Locale;
  labels: { prev: string; forecast: string; actual: string };
  tooltipLabels: TooltipLabels;
}) {
  const detailRows = [
    { label: tooltipLabels.sources, value: item.details?.sources },
    { label: tooltipLabels.measures, value: item.details?.measures },
    { label: tooltipLabels.usualEffect, value: item.details?.usualEffect },
    { label: tooltipLabels.frequency, value: item.details?.frequency },
    { label: tooltipLabels.nextRelease, value: item.details?.nextRelease },
    { label: tooltipLabels.notes, value: item.details?.notes },
    { label: tooltipLabels.whyCare, value: item.details?.whyCare },
  ].filter((entry) => Boolean(String(entry.value ?? "").trim()));

  const hasDetails = detailRows.length > 0;

  return (
    <li
      className={`group relative flex items-center justify-between gap-3 rounded-lg border ${
        item.impact === 3
          ? "border-blue-300 bg-blue-500/20"
          : "border-slate-200 bg-white"
      } px-3 py-3 shadow-sm transition hover:border-blue-300 hover:shadow-md`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {item.countryCode ? (
          <span className={`fi fi-${item.countryCode} h-4 w-5 rounded`} />
        ) : (
          <span className="h-4 w-5 rounded bg-slate-200" aria-hidden="true" />
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold text-slate-800">{item.time}</p>
            <span className="text-[10px] font-semibold text-slate-400">
              {item.currency}
            </span>
          </div>
          <p className="truncate text-xs font-semibold text-slate-700">
            {item.title}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
            {labels.prev}: {item.previous} | {labels.forecast}: {item.forecast}{" "}
            | {labels.actual}: {item.actual}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <ImpactStars value={item.impact} />
      </div>

      {hasDetails ? (
        <div className="pointer-events-none absolute left-3 right-3 top-full z-20 mt-2 hidden translate-y-2 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-blue-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
                {locale === "en" ? "Event Details" : "Detail Event"}
              </p>
              <i
                className="fa-solid fa-circle-info text-xs text-slate-400"
                aria-hidden="true"
              />
            </div>
            <div className="grid gap-2 px-3 py-3">
              {detailRows.map((entry) => (
                <div key={entry.label} className="grid gap-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {entry.label}
                  </p>
                  <p className="text-xs leading-5 text-slate-700">
                    {entry.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export async function EconomicCalendarCard({
  locale = "id",
  messages,
  href,
  title,
  viewAllLabel,
  items,
  maxItems = 4,
}: EconomicCalendarCardProps) {
  const resolvedMaxItems = Math.min(5, Math.max(1, maxItems));
  const todayLabel = formatTodayLabel(locale);
  const resolvedTitle =
    title ??
    messages?.widgets?.calendarEkonomi?.title ??
    (locale === "en" ? "Economic Calendar" : "Kalender Ekonomi");
  const resolvedViewAllLabel =
    viewAllLabel ??
    messages?.widgets?.calendarEkonomi?.cta ??
    (locale === "en" ? "View Full..." : "Lihat Semua...");
  const resolvedHref = href ?? `/${locale}/analysis/economic-calendar`;
  const metaLabels = { prev: "Prev", forecast: "Forecast", actual: "Act" };
  const tooltipLabels: TooltipLabels = {
    noDetails:
      locale === "en" ? "No additional details." : "Tidak ada detail tambahan.",
    sources: locale === "en" ? "Sources" : "Sumber",
    measures: locale === "en" ? "Measures" : "Ukuran",
    usualEffect: locale === "en" ? "Usual Effect" : "Efek Biasa",
    frequency: locale === "en" ? "Frequency" : "Frekuensi",
    nextRelease: locale === "en" ? "Next Release" : "Rilis Berikutnya",
    notes: locale === "en" ? "Notes" : "Catatan",
    whyCare: locale === "en" ? "Why Traders Care" : "Mengapa Trader Peduli",
  };

  const resolvedItems = items?.length
    ? items.slice(0, resolvedMaxItems)
    : ((await fetchEconomicCalendarToday(resolvedMaxItems)) ??
      DEFAULT_ITEMS.slice(0, resolvedMaxItems));

  return (
    <Card className="overflow-visible h-full">
      <SectionHeader
        title={resolvedTitle}
        actions={
          resolvedViewAllLabel ? (
            <Link
              href={resolvedHref}
              className="rounded-full bg-blue-700 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-blue-800"
            >
              {resolvedViewAllLabel}
            </Link>
          ) : null
        }
      />

      <div className="px-4 py-4">
        {resolvedItems.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {resolvedItems.map((item) => (
              <CalendarRow
                key={item.key}
                item={item}
                locale={locale}
                labels={metaLabels}
                tooltipLabels={tooltipLabels}
              />
            ))}
          </ul>
        ) : (
          <div className="bg-slate-200 rounded-md p-4">
            <p className="text-center text-sm italic text-slate-500">
              {locale === "en"
                ? `No economic calendar scheduled for today (${todayLabel}).`
                : `Tidak ada kalender ekonomi yang dijadwalkan untuk hari ini (${todayLabel}).`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
