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
const API_BASE = process.env.ENDPO_NM23_BASE ?? "";

const API_ENDPOINT = `${API_BASE}/api/newsmaker-v2/bi-rate`;
const PAGE_SIZE = 20;

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
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

const formatRate = (row: BiRateRow) => {
  if (row.raw_rate) return row.raw_rate.replace(/\s+/g, "");
  const value = parseRateNumber(row.rate);
  if (value === undefined) return "-";
  return `${value.toFixed(2)}%`;
};

const formatDate = (row: BiRateRow) => row.raw_date ?? row.date ?? "-";

const formatFullDate = (isoDate?: string) => {
  if (!isoDate) return "-";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  const day = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(
    parsed,
  );
  const date = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(parsed)
    .replace(".", ".");
  return `${day}, ${date} - ${time}`;
};

export async function BiRateTable({ messages, locale, page }: BiRateTableProps) {
  const biRateResponse = await fetchJson<BiRateResponse>(API_ENDPOINT);
  const rows = biRateResponse?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedRows = rows.slice(startIndex, startIndex + PAGE_SIZE);
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
      if (startPage > 2) {
        paginationItems.push("left-ellipsis");
      }
    }

    for (let targetPage = startPage; targetPage <= endPage; targetPage += 1) {
      paginationItems.push(targetPage);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationItems.push("right-ellipsis");
      }
      paginationItems.push(totalPages);
    }
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 mt-3 ring-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {biRatePage?.kicker && (
            <p className="text-xs uppercase tracking-wider text-slate-400">
              {biRatePage.kicker}
            </p>
          )}
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            {biRatePage?.title ?? "BI-Rate"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{biRatePage?.subtitle}</p>
        </div>
        {biRateResponse?.fetched_at && (
          <span className="text-xs text-slate-400">
            {updatedLabel}: {formatFullDate(biRateResponse.fetched_at)}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          {emptyLabel}
        </div>
      ) : (
        <div className="mt-6">
          <div className="space-y-3">
            {paginatedRows.map((row, index) => {
              return (
                <div
                  key={`${row.raw_date ?? row.date ?? "bi-rate"}-${startIndex + index}`}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md hover:ring-1 hover:ring-slate-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-400">
                        {String(startIndex + index + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-400">
                        {columns[0]}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatDate(row)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
                        {formatRate(row)}
                      </span>
                      <div>
                        {row.press_release_url ? (
                          <a
                            href={row.press_release_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            {pressReleaseLabel}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
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
          )}
        </div>
      )}

      {biRateResponse?.source && (
        <div className="mt-4 text-sm text-slate-600 text-right">
          <span className="font-semibold text-slate-700">{sourceLabel}:</span>{" "}
          <a
            href={biRateResponse.source}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2"
          >
            Bank Indonesia
          </a>
        </div>
      )}
    </section>
  );
}
