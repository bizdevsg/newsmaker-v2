"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import type { HistoricalDataItem } from "@/lib/historical-data";
import type { Locale, Messages } from "@/locales";

const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const safeNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatNumber = (value: unknown, locale: Locale) => {
  const n = safeNumber(value);
  if (n === null) return "-";
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    maximumFractionDigits: 6,
  }).format(n);
};

export function HistoricalDataClient({
  locale,
  initialItems,
  messages,
}: {
  locale: Locale;
  initialItems: HistoricalDataItem[];
  messages: Messages;
}) {
  const t = messages.policy.historicData;

  const [items, setItems] = useState<HistoricalDataItem[]>(initialItems);
  const [category, setCategory] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [limit, setLimit] = useState("200");
  const [isLoading, setIsLoading] = useState(false);

  const shownItems = useMemo(() => {
    const toTime = (value: string) => {
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return items.slice().sort((a, b) => {
      const byDate = toTime(b.tanggal) - toTime(a.tanggal);
      if (byDate !== 0) return byDate;
      return b.id - a.id;
    });
  }, [items]);

  const refresh = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const parsedLimit = Number(limit);
      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        params.set("limit", String(Math.min(500, Math.floor(parsedLimit))));
      }
      if (category.trim()) params.set("category", category.trim());
      if (tanggal.trim()) params.set("tanggal", tanggal.trim());

      const response = await fetch(
        `/api/historical-data${params.toString() ? `?${params.toString()}` : ""}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        },
      );
      const payload = (await response.json().catch(() => null)) as {
        data?: HistoricalDataItem[];
      } | null;
      setItems(Array.isArray(payload?.data) ? payload!.data : []);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <SectionHeader
        title={t.title}
        optional={
          <span className="text-xs font-semibold text-slate-500">
            {shownItems.length
              ? `${shownItems.length} ${t.rowsLabel}`
              : t.subtitle}
          </span>
        }
      />

      <div className="px-4 py-5">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="grid gap-1">
            <span className="text-xs font-extrabold text-slate-700">
              {t.labels.category}
            </span>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder={t.placeholders.category}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-extrabold text-slate-700">
              {t.labels.date}
            </span>
            <input
              value={tanggal}
              onChange={(event) => setTanggal(event.target.value)}
              placeholder={t.placeholders.date}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-extrabold text-slate-700">
              {t.labels.limit}
            </span>
            <input
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              inputMode="numeric"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300"
            />
          </label>

          <div className="flex items-end">
            <Button
              size="sm"
              variant="primary"
              className={classNames("w-full", isLoading && "opacity-70")}
              onClick={refresh}
            >
              {isLoading ? "..." : t.labels.refresh}
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-auto">
            <table className="min-w-[980px] w-full border-separate border-spacing-0 text-sm">
	              <thead className="bg-slate-50">
	                <tr className="text-left text-xs font-semibold text-slate-700">
	                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 border-b border-slate-200">
	                    {t.table.date}
	                  </th>
	                  <th className="px-4 py-3 border-b border-slate-200">
	                    {t.table.open}
	                  </th>
	                  <th className="px-4 py-3 border-b border-slate-200">
	                    {t.table.high}
	                  </th>
	                  <th className="px-4 py-3 border-b border-slate-200">
	                    {t.table.low}
	                  </th>
	                  <th className="px-4 py-3 border-b border-slate-200">
	                    {t.table.close}
	                  </th>
	                </tr>
	              </thead>
              <tbody>
                {shownItems.length ? (
                  shownItems.map((row) => {
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-slate-100 ${row.isBankHoliday ? "bg-red-100" : ""}`}
                      >
                        <td className="sticky left-0 px-4 py-3 font-semibold border-b border-slate-100 text-slate-900">
                          {row.tanggal}
                        </td>
                        {row.isBankHoliday ? (
                          <td
                            colSpan={4}
                            className="px-4 py-3 border-b border-slate-100 text-sm"
                          >
                            <div className="bg-red-200 py-0.5 px-3 rounded-full w-fit text-center mx-auto">
                              <span className="font-semibold">
                                {row.description || t.table.bankHoliday}
                              </span>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="px-4 py-3 border-b border-slate-100 text-slate-700">
                              {formatNumber(row.open, locale)}
                            </td>
                            <td className="px-4 py-3 border-b border-slate-100 text-slate-700">
                              {formatNumber(row.high, locale)}
                            </td>
                            <td className="px-4 py-3 border-b border-slate-100 text-slate-700">
                              {formatNumber(row.low, locale)}
                            </td>
                            <td className="px-4 py-3 border-b border-slate-100 text-slate-700">
                              {formatNumber(row.close, locale)}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={9}
	                      className="px-4 py-8 text-center text-sm font-semibold text-slate-600"
	                    >
	                      {t.empty}
	                    </td>
	                  </tr>
	                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
