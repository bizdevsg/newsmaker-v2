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
};

type CalendarResponse = {
  updatedAt?: string;
  data?: CalendarItem[];
};

const ENDPOAPI_BASE = process.env.NEXT_PUBLIC_ENDPOAPI_BASE ?? "";
const CALENDAR_URL = `${ENDPOAPI_BASE}/api/calendar/today`;

export default function CalenderEkonomiHome() {
  const loading = useLoading();
  const { locale } = useParams<{ locale?: string }>();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const initialLoad = useRef(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCalendar = async () => {
      const token = initialLoad.current
        ? loading.start("calendar-home")
        : null;
      try {
        const response = await fetch(CALENDAR_URL, { cache: "no-store" });
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

    fetchCalendar();
    const id = window.setInterval(fetchCalendar, 30000);
    return () => {
      isMounted = false;
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

  return (
    <section className="rounded-md bg-white shadow overflow-hidden border border-slate-100">
      <div className="h-full flex flex-col justify-between">
        <SectionHeader
          title="Economic Calendar"
          optional={formattedUpdatedAt}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-2 text-center font-semibold">Time</th>
                <th className="px-2 py-2 text-center font-semibold">Curr</th>
                <th className="px-2 py-2 text-center font-semibold">Impact</th>
                <th className="px-2 py-2 text-center font-semibold">Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.slice(0, 5).map((item, index) => (
                <tr key={`${item.time}-${item.event}-${index}`}>
                  <td className="px-5 py-3 text-center font-semibold text-slate-700">
                    {item.time}
                  </td>
                  <td className="px-2 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                    {item.currency}
                  </td>
                  <td className="px-2 py-3 text-center text-xs text-amber-600">
                    {item.impact}
                  </td>
                  <td className="px-2 py-3 text-slate-700">{item.event}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-5 py-3 text-xs text-slate-500" colSpan={4}>
                    Data belum tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4">
          <Link
            href={`/${locale ?? "id"}/policy`}
            className="inline-flex w-full items-center justify-center rounded-md bg-blue-700 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            View Full Calendar
          </Link>
        </div>
      </div>
    </section>
  );
}
