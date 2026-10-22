"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import type { HistoricalDataItem } from "@/lib/historical-data";
import type { Locale } from "@/locales";
import {
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY,
  HISTORICAL_MINI_ROWS,
  normalizeCategory,
  parseTimestamp,
} from "./historicalMini";

export function HistoricalDataMiniCard({
  locale,
  items,
  className = "",
}: {
  locale: Locale;
  items: HistoricalDataItem[];
  className?: string;
}) {
  const [category, setCategory] =
    useState<(typeof CATEGORY_OPTIONS)[number]>(DEFAULT_CATEGORY);

  const rows = useMemo(() => {
    const normalized = category.toLowerCase();
    return items
      .filter((item) => normalizeCategory(item.category) === normalized)
      .sort((a, b) => parseTimestamp(b.tanggal) - parseTimestamp(a.tanggal))
      .slice(0, HISTORICAL_MINI_ROWS);
  }, [items, category]);

  return (
    <Card className={`flex flex-col ${className}`.trim()}>
      <SectionHeader
        title="Historical Data"
        link={`/${locale}/tools/historical-data`}
        linkLabel={locale === "en" ? "View all" : "Lihat semua"}
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <select
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value as (typeof CATEGORY_OPTIONS)[number],
            )
          }
          className="w-full rounded-md border-0 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-300 transition focus:ring-2 focus:ring-blue-500"
          aria-label={locale === "en" ? "Select product" : "Pilih produk"}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full border-separate border-spacing-0 text-[11px]">
            <caption className="sr-only">{`Historical data - ${category}`}</caption>
            <thead className="bg-slate-50">
              <tr className="text-left font-semibold text-slate-600">
                <th scope="col" className="border-b border-slate-200 px-2 py-2">
                  Date
                </th>
                {["Open", "High", "Low", "Close"].map((label) => (
                  <th
                    key={label}
                    scope="col"
                    className="border-b border-slate-200 px-2 py-2 text-right"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap border-b border-slate-100 px-2 py-2 font-semibold text-slate-900">
                      {row.tanggal}
                    </td>
                    {[row.open, row.high, row.low, row.close].map(
                      (value, index) => (
                        <td
                          key={index}
                          className="border-b border-slate-100 px-2 py-2 text-right tabular-nums"
                        >
                          {value ?? "-"}
                        </td>
                      ),
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-slate-500">
                    {locale === "en"
                      ? "No data available."
                      : "Data belum tersedia."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
