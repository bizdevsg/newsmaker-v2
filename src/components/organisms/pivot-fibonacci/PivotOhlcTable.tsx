"use client";

import React, { useMemo, useState } from "react";
import type { HistoricalDataItem } from "@/lib/historical-data";
import type { Locale } from "@/locales";

// Same product list as the Historical Data tool, so the dropdown here stays
// consistent with it.
const CATEGORY_OPTIONS = [
  "LGD Daily",
  "BCO Daily",
  "HSI Daily",
  "SNI Daily",
  "AUD/USD",
  "EUR/USD",
  "GBP/USD",
  "USD/CHF",
  "USD/JPY",
] as const;

const DEFAULT_CATEGORY: (typeof CATEGORY_OPTIONS)[number] = "LGD Daily";
const ROWS = 10;

const parseTimestamp = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function PivotOhlcTable({
  locale,
  items,
}: {
  locale: Locale;
  items: HistoricalDataItem[];
}) {
  const [category, setCategory] =
    useState<(typeof CATEGORY_OPTIONS)[number]>(DEFAULT_CATEGORY);

  const rows = useMemo(() => {
    const normalizedCategory = category.trim().toLowerCase();
    return items
      .filter(
        (item) =>
          (item.category ?? "").trim().toLowerCase() === normalizedCategory,
      )
      .slice()
      .sort((a, b) => parseTimestamp(b.tanggal) - parseTimestamp(a.tanggal))
      .slice(0, ROWS);
  }, [items, category]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {locale === "en" ? "Recent OHLC data" : "Data OHLC terbaru"}
        </p>
        <select
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value as (typeof CATEGORY_OPTIONS)[number],
            )
          }
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-600/50"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-auto">
          <table className="min-w-[560px] w-full border-separate border-spacing-0 text-sm">
            <caption className="sr-only">
              {`Recent OHLC data - ${category}`}
            </caption>
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold text-slate-700">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-slate-50 px-4 py-3 border-b border-slate-200"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 border-b border-slate-200 text-right"
                >
                  Open
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 border-b border-slate-200 text-right"
                >
                  High
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 border-b border-slate-200 text-right"
                >
                  Low
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 border-b border-slate-200 text-right"
                >
                  Close
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="sticky left-0 bg-white px-4 py-3 font-semibold border-b border-slate-100 text-slate-900 group-hover:bg-slate-50">
                      {row.tanggal}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                      {row.open ?? "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                      {row.high ?? "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                      {row.low ?? "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                      {row.close ?? "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-slate-500"
                  >
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
    </div>
  );
}
