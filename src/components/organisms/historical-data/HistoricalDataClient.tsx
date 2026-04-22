"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
const ROWS_PER_PAGE = 10;

const formatIsoLike = (value: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}${pad(value.getMonth() + 1)}${pad(
    value.getDate(),
  )}-${pad(value.getHours())}${pad(value.getMinutes())}`;
};

const sanitizeFilenamePart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const escapeCsvCell = (value: string) => {
  const normalized = value.replace(/\r?\n/g, " ").trim();
  if (!normalized) return "";
  if (/[",\n]/.test(normalized)) return `"${normalized.replace(/"/g, '""')}"`;
  return normalized;
};

const parseItemTimestamp = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) return [1, 2, 3, "...", totalPages] as const;
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, "...", currentPage, "...", totalPages] as const;
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
  const [category, setCategory] =
    useState<(typeof CATEGORY_OPTIONS)[number]>(DEFAULT_CATEGORY);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const downloadLabels = useMemo(() => {
    return {
      csv: locale === "en" ? "Download CSV" : "Unduh CSV",
      pdf: locale === "en" ? "Download PDF" : "Unduh PDF",
    };
  }, [locale]);

  const paginationLabels = useMemo(() => {
    return {
      page: locale === "en" ? "Page" : "Halaman",
      of: locale === "en" ? "of" : "dari",
      previous: locale === "en" ? "Previous" : "Sebelumnya",
      next: locale === "en" ? "Next" : "Berikutnya",
      showing: locale === "en" ? "Showing" : "Menampilkan",
    };
  }, [locale]);

  const filteredItems = useMemo(() => {
    const normalizedCategory = category.trim().toLowerCase();
    const rangeStartRaw = startDate.trim();
    const rangeEndRaw = endDate.trim();
    const startTs = rangeStartRaw ? Date.parse(rangeStartRaw) : NaN;
    const endTs = rangeEndRaw ? Date.parse(rangeEndRaw) : NaN;
    const hasStart = Number.isFinite(startTs);
    const hasEnd = Number.isFinite(endTs);
    const rangeStart =
      hasStart && hasEnd ? Math.min(startTs, endTs) : hasStart ? startTs : null;
    const rangeEnd =
      hasStart && hasEnd ? Math.max(startTs, endTs) : hasEnd ? endTs : null;

    const filtered = items.filter((item) => {
      if ((item.category ?? "").trim().toLowerCase() !== normalizedCategory) {
        return false;
      }

      if (rangeStart === null && rangeEnd === null) return true;

      const ts = parseItemTimestamp(item.tanggal);
      if (!ts) return false;
      if (rangeStart !== null && ts < rangeStart) return false;
      if (rangeEnd !== null && ts > rangeEnd) return false;
      return true;
    });

    return filtered.slice().sort((a, b) => {
      const byDate =
        parseItemTimestamp(b.tanggal) - parseItemTimestamp(a.tanggal);
      if (byDate !== 0) return byDate;
      return b.id - a.id;
    });
  }, [category, endDate, items, startDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, endDate, items, startDate]);

  const totalRows = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / ROWS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = totalRows ? (safeCurrentPage - 1) * ROWS_PER_PAGE : 0;
  const pageEnd = Math.min(pageStart + ROWS_PER_PAGE, totalRows);

  const shownItems = useMemo(() => {
    return filteredItems.slice(pageStart, pageEnd);
  }, [filteredItems, pageEnd, pageStart]);

  const visibleRangeLabel =
    totalRows > 0
      ? `${paginationLabels.showing} ${pageStart + 1}-${pageEnd} ${paginationLabels.of} ${totalRows}`
      : t.subtitle;

  const buildFilename = (ext: "csv" | "pdf") => {
    const parts = [
      "historical-data",
      sanitizeFilenamePart(category),
      startDate.trim() ? sanitizeFilenamePart(startDate) : "all",
      endDate.trim() ? sanitizeFilenamePart(endDate) : "all",
      formatIsoLike(new Date()),
    ].filter(Boolean);

    return `${parts.join("_")}.${ext}`;
  };

  const downloadCsv = () => {
    const headers =
      Array.isArray(t.columns) && t.columns.length >= 5
        ? (t.columns.slice(0, 5) as string[])
        : [
            locale === "en" ? "Date" : "Tanggal",
            "Open",
            "High",
            "Low",
            "Close",
          ];

    const rows = filteredItems.map((row) => {
      if (row.isBankHoliday) {
        return [
          row.tanggal,
          "",
          "",
          "",
          "",
          row.description || t.table.bankHoliday || "",
        ];
      }

      return [
        row.tanggal,
        String(row.open ?? ""),
        String(row.high ?? ""),
        String(row.low ?? ""),
        String(row.close ?? ""),
        "",
      ];
    });

    const noteHeader = locale === "en" ? "Note" : "Keterangan";
    const csv = [
      [...headers, noteHeader].map(escapeCsvCell).join(","),
      ...rows.map((cells) => cells.map(escapeCsvCell).join(",")),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = buildFilename("csv");
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const downloadPdf = () => {
    const win = window.open("", "_blank");
    if (!win) return;

    const title = `${t.title} - ${category}`;
    const subtitleParts = [
      startDate.trim() ? `${t.filters.start}: ${startDate.trim()}` : null,
      endDate.trim() ? `${t.filters.end}: ${endDate.trim()}` : null,
    ].filter(Boolean);

    const subtitle = subtitleParts.join(" | ");

    const headerCells = [
      t.table.date,
      t.table.open,
      t.table.high,
      t.table.low,
      t.table.close,
      locale === "en" ? "Note" : "Keterangan",
    ];

    const bodyRows = filteredItems
      .map((row) => {
        const cells = row.isBankHoliday
          ? [
              row.tanggal,
              "-",
              "-",
              "-",
              "-",
              row.description || t.table.bankHoliday || "",
            ]
          : [
              row.tanggal,
              formatNumber(row.open, locale),
              formatNumber(row.high, locale),
              formatNumber(row.low, locale),
              formatNumber(row.close, locale),
              "",
            ];

        return `<tr>${cells
          .map((cell) => `<td>${String(cell ?? "").replace(/</g, "&lt;")}</td>`)
          .join("")}</tr>`;
      })
      .join("");

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
      h1 { font-size: 18px; margin: 0 0 6px; }
      .sub { font-size: 12px; color: #475569; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; vertical-align: top; }
      th { background: #f8fafc; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    ${subtitle ? `<div class="sub">${subtitle}</div>` : ""}
    <table>
      <thead>
        <tr>${headerCells.map((cell) => `<th>${cell}</th>`).join("")}</tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
    <script>
      window.onload = () => { window.print(); };
    </script>
  </body>
</html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const refresh = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/historical-data", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const payload = (await response.json().catch(() => null)) as {
        data?: HistoricalDataItem[];
      } | null;

      setItems(Array.isArray(payload?.data) ? payload.data : []);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const paginationItems = getPaginationItems(safeCurrentPage, totalPages);

  return (
    <Card className="overflow-hidden">
      <SectionHeader
        title={t.title}
        optional={
          <span className="text-xs font-semibold text-slate-500">
            {totalRows
              ? `${totalRows} ${t.rowsLabel} | ${visibleRangeLabel}`
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
            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as (typeof CATEGORY_OPTIONS)[number],
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-300"
            >
              {CATEGORY_OPTIONS.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-extrabold text-slate-700">
              {t.filters.start}
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              placeholder={t.placeholders.date}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-300"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-extrabold text-slate-700">
              {t.filters.end}
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              placeholder={t.placeholders.date}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-300"
            />
          </label>

          <div className="flex items-end">
            <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-3">
              <Button
                size="sm"
                variant="primary"
                className={classNames("w-full", isLoading && "opacity-70")}
                onClick={refresh}
              >
                {isLoading ? "..." : t.labels.refresh}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={downloadCsv}
              >
                {downloadLabels.csv}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={downloadPdf}
              >
                {downloadLabels.pdf}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-auto">
            <table className="min-w-[980px] w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-700">
                  <th className="sticky left-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3">
                    {t.table.date}
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    {t.table.open}
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    {t.table.high}
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    {t.table.low}
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
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
                        className={`border-b border-slate-100 ${
                          row.isBankHoliday ? "bg-red-100" : ""
                        }`}
                      >
                        <td className="sticky left-0 border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">
                          {row.tanggal}
                        </td>
                        {row.isBankHoliday ? (
                          <td
                            colSpan={4}
                            className="border-b border-slate-100 px-4 py-3 text-sm"
                          >
                            <div className="mx-auto w-fit rounded-full bg-red-200 px-3 py-0.5 text-center">
                              <span className="font-semibold">
                                {row.description || t.table.bankHoliday}
                              </span>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                              {formatNumber(row.open, locale)}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                              {formatNumber(row.high, locale)}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                              {formatNumber(row.low, locale)}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
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

        {totalRows ? (
          <div className="mt-4 flex flex-col gap-3 items-center justify-center">
            <div className="flex flex-nowrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage <= 1}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-slate-200 px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={paginationLabels.previous}
              >
                &lt;
              </button>

              {paginationItems.map((item, index) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-xs font-semibold text-slate-400"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    aria-current={item === safeCurrentPage ? "page" : undefined}
                    className={classNames(
                      "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-3 text-xs font-semibold transition",
                      item === safeCurrentPage
                        ? "border-blue-700 bg-blue-700 text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={safeCurrentPage >= totalPages}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-slate-200 px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={paginationLabels.next}
              >
                &gt;
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
