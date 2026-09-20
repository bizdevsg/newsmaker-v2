"use client";

import React, { useMemo } from "react";
import type { Locale, Messages } from "@/locales";
import type { IcdxVolumeResponse, IcdxVolumeRow } from "@/types/indonesiaMarket";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type IcdxVolumeChartProps = {
  locale: Locale;
  messages?: Messages;
  data: IcdxVolumeResponse | null;
};

type ChartRow = {
  label: string;
  volume: number;
  sourceUrl?: string;
};

const normalizeRows = (rows: IcdxVolumeRow[] | undefined): ChartRow[] =>
  (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      label: typeof row.periodLabel === "string" ? row.periodLabel : "",
      volume: typeof row.volumeLot === "number" ? row.volumeLot : Number.NaN,
      sourceUrl: row.sourceUrl,
    }))
    .filter((row) => row.label.length > 0 && Number.isFinite(row.volume));

const formatNumber = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID").format(value);

export function IcdxVolumeChart({ locale, data }: IcdxVolumeChartProps) {
  const rows = useMemo(() => normalizeRows(data?.data), [data?.data]);

  const title = locale === "en" ? "ICDX Volume Activity" : "Aktivitas Volume ICDX";
  const subtitle =
    locale === "en"
      ? "Trading volume per period, curated from ICDX press releases (irregular coverage)."
      : "Volume transaksi per periode, dikurasi dari press release ICDX (cakupan gak rutin).";

  const latest = rows[rows.length - 1];

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <p className="text-sm text-slate-500">
          {locale === "en"
            ? "No volume data could be parsed right now. Please check ICDX press releases directly."
            : "Data volume belum bisa dibaca saat ini. Silakan cek langsung press release ICDX."}
        </p>
        {data?.source && (
          <a
            href={data.source}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs text-blue-600 hover:underline"
          >
            {data.source}
          </a>
        )}
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
        {latest && (
          <div className="mt-3 text-sm md:mt-0 md:text-right">
            <p className="font-semibold text-slate-800">
              {locale === "en" ? "Latest" : "Terbaru"} ({latest.label}):{" "}
              <span className="font-bold">
                {formatNumber(latest.volume, locale)} lot
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
        <div className="w-full">
          <ResponsiveContainer
            width="100%"
            height={420}
            minHeight={320}
            minWidth={480}
            initialDimension={{ width: 720, height: 320 }}
            debounce={50}
          >
            <BarChart data={rows} margin={{ top: 12, right: 16, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#334155" }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(value) =>
                  typeof value === "number" ? formatNumber(value, locale) : String(value)
                }
              />
              <Tooltip
                formatter={(value) => {
                  if (typeof value === "number") return `${formatNumber(value, locale)} lot`;
                  return String(value);
                }}
                labelFormatter={(label) => String(label)}
                contentStyle={{
                  borderRadius: 10,
                  borderColor: "#e2e8f0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Bar dataKey="volume" fill="#B31610" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data?.parse_warning && (
        <p className="mt-3 text-xs text-amber-600">
          {locale === "en"
            ? "Some press releases could not be parsed and were skipped."
            : "Sebagian press release gagal dibaca otomatis dan dilewati."}
        </p>
      )}

      <p className="mt-3 text-xs text-slate-400">
        {locale === "en" ? "Source: ICDX press releases" : "Sumber: press release ICDX"}{" "}
        {data?.source && (
          <a href={data.source} target="_blank" rel="noreferrer" className="hover:underline">
            • {data.source}
          </a>
        )}
      </p>
    </div>
  );
}
