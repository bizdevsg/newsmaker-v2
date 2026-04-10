import Link from "next/link";
import React from "react";
import type { Locale, Messages } from "@/locales";
import type { BiRateResponse, BiRateRow } from "@/types/indonesiaMarket";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

type BiRateTableProps = {
  messages: Messages;
  locale: Locale;
  page: number;
};

const API_TOKEN = process.env.ENDPO_NM23_TOKEN ?? "";
const API_BASE =
  process.env.ENDPO_NM23_BASE ??
  process.env.NEXT_PUBLIC_ENDPOAPI_BASE ??
  "https://endpo-nm23.vercel.app";

const API_ENDPOINT = `${API_BASE.replace(/\/$/, "")}/api/newsmaker-v2/bi-rate`;
const PAGE_SIZE = 20;

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
      },
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const parseRateNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[%\s,]/g, "");
    const parsed = Number.parseFloat(cleaned);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const getRateValue = (row: BiRateRow) =>
  parseRateNumber(row.raw_rate ?? row.rate) ?? undefined;

const formatRate = (row: BiRateRow) => {
  if (row.raw_rate) return row.raw_rate.replace(/\s+/g, "").replace("%", "%");
  const value = parseRateNumber(row.rate);
  if (value === undefined) return "-";
  return `${value.toFixed(2)}%`;
};

const getTimestamp = (row: BiRateRow) => {
  const timestamp = Date.parse(row.date ?? "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatDate = (row: BiRateRow, locale: Locale) => {
  if (locale === "id" && row.raw_date) return row.raw_date;
  if (row.date) {
    const parsed = new Date(row.date);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(parsed);
    }
  }
  return row.raw_date ?? row.date ?? "-";
};

const formatFullDate = (isoDate: string | undefined, locale: Locale) => {
  if (!isoDate) return "-";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  const dateLocale = locale === "en" ? "en-US" : "id-ID";
  const weekday = new Intl.DateTimeFormat(dateLocale, {
    weekday: "long",
  }).format(parsed);
  const date = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
  return `${weekday}, ${date}`;
};

const formatDelta = (delta: number, locale: Locale) => {
  if (!Number.isFinite(delta)) return locale === "en" ? "N/A" : "-";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(2)}%`;
};

export async function BiRateTable({
  messages,
  locale,
  page,
}: BiRateTableProps) {
  const biRateResponse = await fetchJson<BiRateResponse>(API_ENDPOINT);
  const rows = Array.isArray(biRateResponse?.data) ? biRateResponse.data : [];

  const sortedRows = [...rows].sort(
    (a, b) => getTimestamp(b) - getTimestamp(a),
  );

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedRows = sortedRows.slice(startIndex, startIndex + PAGE_SIZE);

  const { biRatePage } = messages.policy;
  const updatedLabel = biRatePage?.updatedLabel ?? "Updated";
  const emptyLabel = biRatePage?.empty ?? "BI-Rate data unavailable.";
  const columns = biRatePage?.columns ?? [
    "Date",
    "BI Rate",
    "Change",
    "Release",
  ];
  const sourceLabel = biRatePage?.sourceLabel ?? "Source";
  const pressReleaseLabel = biRatePage?.pressReleaseLabel ?? "Press Release";
  const previousLabel = locale === "en" ? "Previous" : "Sebelumnya";
  const nextLabel = locale === "en" ? "Next" : "Berikutnya";
  const pageStatusLabel =
    locale === "en"
      ? `Page ${currentPage} of ${totalPages}`
      : `Halaman ${currentPage} dari ${totalPages}`;

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    }
    const query = params.toString();
    return query ? `/${locale}/bi-rate?${query}` : `/${locale}/bi-rate`;
  };

  const paginationItems: Array<number | "left-ellipsis" | "right-ellipsis"> =
    [];
  if (totalPages > 1) {
    const windowSize = 5;
    const halfWindow = Math.floor(windowSize / 2);
    let startPage = Math.max(1, currentPage - halfWindow);
    const endPage = Math.min(totalPages, startPage + windowSize - 1);

    if (endPage - startPage < windowSize - 1) {
      startPage = Math.max(1, endPage - windowSize + 1);
    }

    if (startPage > 1) {
      paginationItems.push(1);
      if (startPage > 2) paginationItems.push("left-ellipsis");
    }

    for (let targetPage = startPage; targetPage <= endPage; targetPage += 1) {
      paginationItems.push(targetPage);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) paginationItems.push("right-ellipsis");
      paginationItems.push(totalPages);
    }
  }

  const latestRow = sortedRows[0];
  const previousRow = sortedRows[1];
  const latestRate = latestRow ? formatRate(latestRow) : "-";
  const latestDate = latestRow ? formatDate(latestRow, locale) : "-";
  const previousRate = previousRow ? formatRate(previousRow) : "-";
  const previousDate = previousRow ? formatDate(previousRow, locale) : "-";
  const latestRateValue = latestRow ? getRateValue(latestRow) : undefined;
  const previousRateValue = previousRow ? getRateValue(previousRow) : undefined;
  const delta =
    latestRateValue !== undefined && previousRateValue !== undefined
      ? latestRateValue - previousRateValue
      : undefined;
  const deltaText =
    typeof delta === "number"
      ? formatDelta(delta, locale)
      : locale === "en"
        ? "N/A"
        : "-";
  const deltaTone =
    typeof delta !== "number"
      ? "flat"
      : delta > 0
        ? "up"
        : delta < 0
          ? "down"
          : "flat";

  return (
    <section className="mt-3 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between w-full gap-4">
        <div>
          {biRatePage?.kicker ? (
            <p className="text-xs uppercase tracking-wider text-slate-400">
              {biRatePage.kicker}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            {biRatePage?.title ?? "BI-Rate"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {biRatePage?.subtitle ??
              (locale === "en"
                ? "Track Bank Indonesia policy rate decisions."
                : "Pantau keputusan suku bunga acuan Bank Indonesia.")}
          </p>
        </div>

        {biRateResponse?.fetched_at ? (
          <div className="text-sm text-right text-slate-500">
            <p className="font-semibold text-slate-700">{updatedLabel}</p>
            <p>{formatFullDate(biRateResponse.fetched_at, locale)}</p>
          </div>
        ) : null}
      </div>

      {paginatedRows.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-500">{emptyLabel}</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {locale === "en" ? "Latest Decision" : "Keputusan Terbaru"}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {latestRate}
                </p>
                <p className="mt-1 text-sm text-slate-500">{latestDate}</p>
              </div>
              {latestRow?.press_release_url ? (
                <a
                  href={latestRow.press_release_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                >
                  {pressReleaseLabel}
                </a>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {locale === "en" ? "Previous Decision" : "Keputusan Sebelumnya"}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {previousRate}
              </p>
              <p className="mt-1 text-sm text-slate-500">{previousDate}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {locale === "en" ? "Change" : "Perubahan"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ${
                    deltaTone === "up"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                      : deltaTone === "down"
                        ? "bg-rose-50 text-rose-700 ring-rose-100"
                        : "bg-slate-50 text-slate-700 ring-slate-200"
                  }`}
                >
                  {deltaTone === "up" ? "▲" : deltaTone === "down" ? "▼" : "•"}{" "}
                  {deltaText}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {locale === "en"
                  ? "Latest vs previous meeting."
                  : "Perbandingan keputusan terbaru dengan sebelumnya."}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                {locale === "en" ? "History" : "Riwayat"}
              </p>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">{columns[0]}</th>
                    <th className="px-4 py-3">{columns[1]}</th>
                    <th className="px-4 py-3">{columns[2]}</th>
                    <th className="px-4 py-3 text-right">{columns[3]}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row, index) => {
                    const currentValue = getRateValue(row);
                    const nextRow = sortedRows[startIndex + index + 1];
                    const nextValue = nextRow
                      ? getRateValue(nextRow)
                      : undefined;
                    const diff =
                      currentValue !== undefined && nextValue !== undefined
                        ? currentValue - nextValue
                        : undefined;
                    const diffTone =
                      typeof diff !== "number"
                        ? "flat"
                        : diff > 0
                          ? "up"
                          : diff < 0
                            ? "down"
                            : "flat";

                    return (
                      <tr
                        key={row.date ?? row.raw_date ?? index}
                        className="border-t border-slate-100 hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {formatDate(row, locale)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
                            {formatRate(row)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                              diffTone === "up"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                : diffTone === "down"
                                  ? "bg-rose-50 text-rose-700 ring-rose-100"
                                  : "bg-slate-50 text-slate-700 ring-slate-200"
                            }`}
                          >
                            {typeof diff === "number"
                              ? formatDelta(diff, locale)
                              : locale === "en"
                                ? "N/A"
                                : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.press_release_url ? (
                            <a
                              href={row.press_release_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              {pressReleaseLabel}
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 p-4 md:hidden">
              {paginatedRows.map((row, index) => {
                const currentValue = getRateValue(row);
                const nextRow = sortedRows[startIndex + index + 1];
                const nextValue = nextRow ? getRateValue(nextRow) : undefined;
                const diff =
                  currentValue !== undefined && nextValue !== undefined
                    ? currentValue - nextValue
                    : undefined;
                const diffTone =
                  typeof diff !== "number"
                    ? "flat"
                    : diff > 0
                      ? "up"
                      : diff < 0
                        ? "down"
                        : "flat";

                return (
                  <div
                    key={row.date ?? row.raw_date ?? index}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="text-xs font-semibold text-slate-400">
                      {formatDate(row, locale)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
                        {formatRate(row)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          diffTone === "up"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                            : diffTone === "down"
                              ? "bg-rose-50 text-rose-700 ring-rose-100"
                              : "bg-slate-50 text-slate-700 ring-slate-200"
                        }`}
                      >
                        {typeof diff === "number"
                          ? formatDelta(diff, locale)
                          : locale === "en"
                            ? "N/A"
                            : "-"}
                      </span>
                      {row.press_release_url ? (
                        <a
                          href={row.press_release_url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          {pressReleaseLabel}
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">{pageStatusLabel}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href={buildPageHref(Math.max(1, currentPage - 1))}
                  aria-disabled={currentPage === 1}
                  className={`inline-flex items-center rounded-md border px-3 py-2 text-xs font-semibold transition ${
                    currentPage === 1
                      ? "pointer-events-none border-slate-200 text-slate-300"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {previousLabel}
                </Link>

                {paginationItems.map((item) => {
                  if (item === "left-ellipsis" || item === "right-ellipsis") {
                    return (
                      <span
                        key={item}
                        className="px-2 text-xs font-semibold text-slate-400"
                      >
                        ...
                      </span>
                    );
                  }

                  if (item === currentPage) {
                    return (
                      <span
                        key={item}
                        aria-current="page"
                        className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-blue-700 px-2 text-xs font-semibold text-white"
                      >
                        {item}
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={item}
                      href={buildPageHref(item)}
                      className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-slate-200 px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {item}
                    </Link>
                  );
                })}

                <Link
                  href={buildPageHref(Math.min(totalPages, currentPage + 1))}
                  aria-disabled={currentPage === totalPages}
                  className={`inline-flex items-center rounded-md border px-3 py-2 text-xs font-semibold transition ${
                    currentPage === totalPages
                      ? "pointer-events-none border-slate-200 text-slate-300"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {nextLabel}
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {biRateResponse?.source ? (
        <div className="mt-4 text-right text-sm text-slate-600">
          <span className="font-semibold text-slate-700">{sourceLabel}:</span>{" "}
          <a
            href={biRateResponse.source}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
          >
            Bank Indonesia
          </a>
        </div>
      ) : null}
    </section>
  );
}
