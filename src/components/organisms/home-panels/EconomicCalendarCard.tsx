import React from "react";
import { Card } from "../../atoms/Card";
import { SectionHeader } from "../../molecules/SectionHeader";
import type { EconomicCalendarItem } from "@/lib/economic-calendar";
import { fetchEconomicCalendarToday } from "@/lib/economic-calendar";
import Link from "next/link";
import type { Locale, Messages } from "@/locales";

type EconomicCalendarCardProps = {
  locale?: Locale;
  messages?: Messages;
  href?: string;
  title?: string;
  viewAllLabel?: string;
  items?: EconomicCalendarItem[];
  maxItems?: number;
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

function ImpactStars({ value }: { value: EconomicCalendarItem["impact"] }) {
  const max = 3;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, index) => {
        const active = index < value;
        const className = active ? "text-amber-400" : "text-slate-200";
        return (
          <i
            key={index}
            className={`fa-solid fa-star text-[10px] ${className}`}
            aria-hidden="true"
          />
        );
      })}
    </span>
  );
}

function CalendarRow({
  item,
  labels,
}: {
  item: EconomicCalendarItem;
  labels: { prev: string; forecast: string; actual: string };
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
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
            {labels.prev}: {item.previous} • {labels.forecast}: {item.forecast}{" "}
            • {labels.actual}: {item.actual}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <ImpactStars value={item.impact} />
      </div>
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
  const resolvedTitle =
    title ??
    messages?.widgets?.calendarEkonomi?.title ??
    (locale === "en" ? "Economic Calendar" : "Kalender Ekonomi");
  const resolvedViewAllLabel =
    viewAllLabel ??
    messages?.widgets?.calendarEkonomi?.cta ??
    (locale === "en" ? "View Full Calendar" : "Lihat Semua Kalender");
  const resolvedHref = href ?? `/${locale}/analysis/economic-calendar`;
  const metaLabels = { prev: "Prev", forecast: "Forecast", actual: "Act" };

  const resolvedItems = items?.length
    ? items.slice(0, resolvedMaxItems)
    : ((await fetchEconomicCalendarToday(resolvedMaxItems)) ??
      DEFAULT_ITEMS.slice(0, resolvedMaxItems));

  return (
    <Card className="h-full">
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
      <div className="p-4">
        <ul className="grid gap-2">
          {resolvedItems.map((item) => (
            <CalendarRow key={item.key} item={item} labels={metaLabels} />
          ))}
        </ul>
      </div>
    </Card>
  );
}
