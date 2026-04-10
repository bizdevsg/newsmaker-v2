"use client";

import React, { useMemo } from "react";
import type { Locale, Messages } from "@/locales";
import type { JfxVolumeResponse, JfxVolumeRow } from "@/types/indonesiaMarket";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BbjVolumeChartProps = {
  locale: Locale;
  messages?: Messages;
  data: JfxVolumeResponse | null;
};

type ChartRow = {
  label: string;
  volume: number;
};

const normalizeRows = (rows: JfxVolumeRow[] | undefined): ChartRow[] =>
  (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      label: typeof row.label === "string" ? row.label.trim() : "",
      volume: typeof row.volume === "number" ? row.volume : Number.NaN,
    }))
    .filter((row) => row.label.length > 0 && Number.isFinite(row.volume));

const formatMonthYear = (
  month: number | undefined,
  year: number | undefined,
  locale: Locale,
) => {
  if (!month || !year) return undefined;
  const date = new Date(Date.UTC(year, month - 1, 1));
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value: string | undefined, locale: Locale) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const formatNumber = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID").format(value);

export function BbjVolumeChart({
  locale,
  messages,
  data,
}: BbjVolumeChartProps) {
  const rows = useMemo(() => normalizeRows(data?.data), [data?.data]);
  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => b.volume - a.volume),
    [rows],
  );

  const totalVolume = useMemo(
    () =>
      rows.length > 0 ? rows.reduce((acc, row) => acc + row.volume, 0) : 0,
    [rows],
  );

  const monthYear = formatMonthYear(data?.month, data?.year, locale);
  const fetchedAt = formatDateTime(data?.fetched_at, locale);

  const title =
    messages?.policySnapshot?.items?.find((item) => item.key === "bbj-activity")
      ?.title ??
    (locale === "en" ? "BBJ Volume Activity" : "Aktivitas Volume BBJ");

  const subtitle =
    locale === "en"
      ? `JFX/BBJ trading volume${monthYear ? ` — ${monthYear}` : ""}.`
      : `Volume transaksi JFX/BBJ${monthYear ? ` — ${monthYear}` : ""}.`;

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <p className="text-sm text-slate-500">
          {locale === "en"
            ? "No volume data is available right now."
            : "Data volume belum tersedia saat ini."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="mt-3 text-sm md:mt-0 md:text-right">
          <p className="font-semibold text-slate-800">
            {locale === "en" ? "Total" : "Total"}:{" "}
            <span className="font-bold">
              {formatNumber(totalVolume, locale)}
            </span>
          </p>
          {fetchedAt && (
            <p className="text-xs text-slate-400">
              {locale === "en" ? "Updated" : "Diperbarui"}: {fetchedAt}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
        <div className="w-full">
          <ResponsiveContainer
            width="100%"
            height={500}
            minHeight={320}
            minWidth={560}
            initialDimension={{ width: 720, height: 320 }}
            debounce={50}
          >
            <BarChart
              data={sortedRows}
              margin={{ top: 12, right: 16, left: 8, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#334155" }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(value) =>
                  typeof value === "number"
                    ? formatNumber(value, locale)
                    : String(value)
                }
              />
              <Tooltip
                formatter={(value) => {
                  if (typeof value === "number")
                    return formatNumber(value, locale);
                  return String(value);
                }}
                labelFormatter={(label) => String(label)}
                contentStyle={{
                  borderRadius: 10,
                  borderColor: "#e2e8f0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Bar dataKey="volume" fill="#1061B3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {locale === "en" ? "Source: JFX (BBJ)" : "Sumber: JFX (BBJ)"}{" "}
        {typeof data?.source === "string" && data.source.trim()
          ? `• ${data.source.trim()}`
          : ""}
      </p>
    </div>
  );
}
