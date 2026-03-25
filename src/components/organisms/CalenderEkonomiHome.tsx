"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SectionHeader } from "../molecules/SectionHeader";
import { useLoading } from "../providers/LoadingProvider";

type CalendarItem = {
  time: string;
  currency: string;
  impact: string;
  event: string;
  date?: string;
  previous?: string;
  forecast?: string;
  actual?: string;
};

type CalendarResponse = {
  updatedAt?: string;
  data?: CalendarItem[];
};

const ENDPOAPI_BASE = process.env.NEXT_PUBLIC_ENDPOAPI_BASE ?? "";
const CALENDAR_URL = `${ENDPOAPI_BASE}/api/calendar/today`;
const REFRESH_INTERVAL_MS = 120_000;
const INITIAL_DELAY_MS = 200;

import type { Messages } from "@/locales";

type CalenderEkonomiHomeProps = {
  locale?: string;
  messages?: Messages;
};

export default function CalenderEkonomiHome({
  locale: propLocale,
  messages,
}: CalenderEkonomiHomeProps) {
  const loading = useLoading();
  const { locale: routeLocale } = useParams<{ locale?: string }>();
  const locale = propLocale || routeLocale;
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const initialLoad = useRef(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCalendar = async () => {
      const token = initialLoad.current ? loading.start("calendar-home") : null;
      try {
        const response = await fetch(CALENDAR_URL);
        if (!response.ok) return;
        const data = (await response.json()) as CalendarResponse;
        if (!isMounted) return;
        setItems(data.data ?? []);
        setUpdatedAt(data.updatedAt);
      } catch {
        // keep last data on error
      } finally {
        if (token) loading.stop(token);
        initialLoad.current = false;
      }
    };

    const initialTimer = window.setTimeout(fetchCalendar, INITIAL_DELAY_MS);
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchCalendar();
      }
    }, REFRESH_INTERVAL_MS);
    return () => {
      isMounted = false;
      window.clearTimeout(initialTimer);
      window.clearInterval(id);
    };
  }, []);

  const formattedUpdatedAt = updatedAt
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      }).format(new Date(updatedAt))
    : "";

  const toFlagClass = (currency: string) => {
    const normalized = currency?.replace(/\./g, "").toUpperCase();
    const map: Record<string, string> = {
      US: "US",
      EU: "EU",
      JP: "JP",
      UK: "GB",
      AU: "AU",
      CA: "CA",
      CH: "CH",
      CN: "CN",
      HK: "HK",
      SG: "SG",
      ID: "ID",
      NZ: "NZ",
      KR: "KR",
      IN: "IN",
      USD: "US",
      EUR: "EU",
      JPY: "JP",
      GBP: "GB",
      AUD: "AU",
      CAD: "CA",
      CHF: "CH",
      CNY: "CN",
      HKD: "HK",
      SGD: "SG",
      IDR: "ID",
      NZD: "NZ",
      KRW: "KR",
      INR: "IN",
    };
    const country = map[normalized] || "UN";
    return `fi-${country.toLowerCase()}`;
  };

  const impactStars = (impact: string) => {
    if (!impact) return 0;
    const starMatches = impact.match(/\u2605/g);
    if (starMatches && starMatches.length > 0) {
      return Math.min(3, starMatches.length);
    }
    const numeric = Number(impact.replace(/[^0-9]/g, ""));
    if (!Number.isNaN(numeric) && numeric > 0) {
      return Math.min(3, Math.max(1, numeric));
    }
    const level = impact.toLowerCase();
    if (level.includes("high")) return 3;
    if (level.includes("medium")) return 2;
    if (level.includes("low")) return 1;
    return 0;
  };

  return (
    <section className="rounded-md bg-white shadow overflow-hidden border border-slate-100">
      <div className="h-full flex flex-col">
        <SectionHeader
          title={
            messages?.widgets?.calendarEkonomi?.title ||
            (locale === "id" ? "Kalender Ekonomi" : "Economic Calendar")
          }
          actions={
            <Link
              href={`/${locale}/policy`}
              className="text-xs text-blue-500 hover:text-blue-600 font-semibold transition duration-300"
            >
              {messages?.widgets?.calendarEkonomi?.cta || "View More..."}
            </Link>
          }
        />
        <div className="divide-y divide-slate-200 px-4 pb-4">
          {items.slice(0, 6).map((item, index) => {
            const stars = impactStars(item.impact);
            return (
              <div
                key={`${item.time}-${item.event}-${index}`}
                className={`flex items-center gap-3 py-3 px-3 ${
                  stars >= 3 ? "bg-rose-50" : "bg-white"
                }`}
              >
                <div className="flex h-10 w-12 items-center justify-center rounded-md border border-slate-200 bg-white">
                  <span
                    className={`fi ${toFlagClass(item.currency)} h-6 w-9 rounded-sm`}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                      {item.time}
                    </span>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      {item.currency}
                    </span>
                  </div>
                  <div className="truncate text-sm font-semibold text-slate-800">
                    {item.event}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                    <span>
                      Prev:{" "}
                      <span className="font-semibold text-slate-700">
                        {item.previous || "-"}
                      </span>
                    </span>
                    <span>
                      Forecast:{" "}
                      <span className="font-semibold text-slate-700">
                        {item.forecast || "-"}
                      </span>
                    </span>
                    <span>
                      Act:{" "}
                      <span
                        className={
                          item.actual
                            ? "font-semibold text-rose-500"
                            : "font-semibold text-slate-700"
                        }
                      >
                        {item.actual || "-"}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-1 py-0.5 ${
                      stars >= 3
                        ? "bg-red-200 text-red-500"
                        : stars === 2
                          ? "bg-amber-100 text-amber-600"
                          : stars === 1
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {stars === 0 ? (
                      <span className="text-[10px] font-semibold">-</span>
                    ) : (
                      Array.from({ length: stars }).map((_, starIndex) => (
                        <svg
                          key={starIndex}
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 2.5l2.86 5.79 6.39.93-4.62 4.5 1.09 6.36L12 17.77l-5.72 3.01 1.09-6.36-4.62-4.5 6.39-.93L12 2.5z" />
                        </svg>
                      ))
                    )}
                  </span>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="px-5 py-3 text-xs text-slate-500">
              {messages?.widgets?.calendarEkonomi?.noData ||
                (locale === "id"
                  ? "Data belum tersedia."
                  : "No data available.")}
            </div>
          )}
        </div>

        {/* <div className="px-5 py-4">
          <Link
            href={`/${locale ?? "id"}/policy`}
            className="inline-flex w-full items-center justify-center rounded-md bg-blue-700 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            {messages?.widgets?.calendarEkonomi?.cta || (locale === "id" ? "Lihat Semua Kalender" : "View Full Calendar")}
          </Link>
        </div> */}
      </div>
    </section>
  );
}
