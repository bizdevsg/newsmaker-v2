"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { EconomicCalendarItem } from "@/lib/economic-calendar";
import type { EconomicCalendarTimeFrame } from "@/lib/economic-calendar";
import type { Locale, Messages } from "@/locales";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { Card } from "@/components/atoms/Card";

type TimeFrame = "today" | "this-week" | "previous-week" | "next-week";

function ImpactStars({ value }: { value: EconomicCalendarItem["impact"] }) {
  // Impact indicator (low/medium/high)
  if (value >= 3)
    return (
      <span className="text-rose-500 text-sm font-bold tracking-tight">
        ★★★
      </span>
    );
  if (value === 2)
    return (
      <span className="text-amber-500 text-sm font-bold tracking-tight">
        ★★
      </span>
    );
  if (value === 1)
    return (
      <span className="text-emerald-500 text-sm font-bold tracking-tight">
        ★
      </span>
    );
  return <span className="text-slate-300 text-sm">—</span>;
}

function flagFromCountryCode(countryCode?: string) {
  const normalized = (countryCode ?? "").trim().toLowerCase();
  if (!normalized) return null;
  return normalized.length === 2 ? normalized : null;
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function EconomicCalendarClient({
  items,
  messages,
  locale = "id",
}: {
  items: EconomicCalendarItem[];
  messages: Messages;
  locale?: Locale;
}) {
  const t = messages.policy.quickData.economicCalendar;

  // Filter state (time-frame tabs)
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("today");
  // Data body state (items shown in table/cards)
  const [currentItems, setCurrentItems] =
    useState<EconomicCalendarItem[]>(items);
  // API loading / error state (when switching time-frame tabs)
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  // Pagination + dropdown state (expanded row)
  const [page, setPage] = useState(1);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const topRef = useRef<HTMLDivElement | null>(null);
  const scrollToTop = () => {
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const shouldScrollRef = useRef(false);

  useEffect(() => {
    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;
    scrollToTop();
  }, [page, timeFrame]);

  const itemsPerPage = 10;

  const filtered = useMemo(() => currentItems, [currentItems]);
  const showDate = timeFrame !== "today";

  const formatDateLabel = (value: string) => {
    const raw = value.trim();
    if (!raw) return "";

    let year = 0;
    let month = 0;
    let day = 0;

    if (raw.includes("-")) {
      const parts = raw.split("-");
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          year = Number(parts[0]);
          month = Number(parts[1]);
          day = Number(parts[2]);
        } else {
          day = Number(parts[0]);
          month = Number(parts[1]);
          year = Number(parts[2]);
        }
      }
    } else if (raw.includes("/")) {
      const parts = raw.split("/");
      if (parts.length >= 3) {
        if (parts[2].length === 4) {
          day = Number(parts[0]);
          month = Number(parts[1]);
          year = Number(parts[2]);
        }
      }
    }

    if (!year || !month || !day) return raw;
    const date = new Date(Date.UTC(year, month - 1, day));
    const localeStr = locale === "id" ? "id-ID" : "en-US";
    return new Intl.DateTimeFormat(localeStr, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, page, totalPages]);

  // Filter tabs (time frames)
  const TIME_FRAMES: Array<{ key: TimeFrame; label: string }> = [
    { key: "today", label: t.timeFrames.today },
    { key: "this-week", label: t.timeFrames["this-week"] },
    { key: "previous-week", label: t.timeFrames["previous-week"] },
    { key: "next-week", label: t.timeFrames["next-week"] },
  ];

  // Dropdown expand/collapse handler (details per row)
  const toggleExpanded = (key: string) =>
    setExpandedKey((prev) => (prev === key ? null : key));

  // Helper for the dropdown content (details labels + values)
  // Always renders the label, and falls back to a placeholder when value is missing.
  const renderDetailsBlock = (
    label: string,
    value?: string,
    fallback: string = "-",
  ) => {
    const normalized = (value ?? "").trim();
    const shown = normalized || fallback;
    return (
      <div>
        <div className="font-bold text-slate-800 mb-0.5">{label}</div>
        <div className="text-slate-600 text-sm whitespace-pre-line">
          {shown}
        </div>
      </div>
    );
  };

  // API fetch when clicking a filter tab (Today / This Week / Previous Week / Next Week)
  const loadTimeFrame = async (next: EconomicCalendarTimeFrame) => {
    if (isLoading) return;
    if (next === timeFrame) return;

    setTimeFrame(next);
    setPage(1);
    setExpandedKey(null);
    setHasError(false);
    shouldScrollRef.current = true;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/economic-calendar/${next}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) {
        setCurrentItems([]);
        setHasError(true);
        return;
      }

      const json = (await response.json().catch(() => null)) as {
        data?: EconomicCalendarItem[];
      } | null;
      const data = Array.isArray(json?.data) ? json?.data : [];
      setCurrentItems(data);
    } catch {
      setCurrentItems([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Row type used by the table/cards to insert "separator" rows (date grouping)
  type CalendarRow =
    | { type: "date"; date: string }
    | { type: "item"; item: EconomicCalendarItem };

  const paginatedWithDate = useMemo(() => {
    const list = paginated;
    if (!showDate)
      return list.map((item): CalendarRow => ({ type: "item", item }));

    const rows: CalendarRow[] = [];

    // Insert date separators before items when the time frame spans multiple days
    let currentDate = "";
    for (const item of list) {
      const date = item.date?.trim() || "—";
      if (date !== currentDate) {
        currentDate = date;
        rows.push({ type: "date", date });
      }
      rows.push({ type: "item", item });
    }
    return rows;
  }, [paginated, showDate]);

  return (
    <Card>
      <div ref={topRef} className="scroll-mt-24" />
      {/* Header: title + total count */}
      <SectionHeader
        title={t.title}
        actions={
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span>
              {filtered.length} {t.eventsLabel}
            </span>
          </div>
        }
      />

      <div className="flex flex-col gap-4 px-4 pt-5 pb-4">
        {/* Filter: time-frame tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {TIME_FRAMES.map((tf) => (
            <button
              key={tf.key}
              type="button"
              onClick={() => loadTimeFrame(tf.key)}
              disabled={isLoading}
              className={classNames(
                "px-4 py-1.5 text-sm font-semibold rounded-full border transition whitespace-nowrap",
                timeFrame === tf.key
                  ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                  : "bg-white text-blue-700 border-blue-200 hover:border-blue-700 hover:bg-blue-50",
                isLoading && "opacity-70 cursor-wait",
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Data body (mobile): cards + date separators + dropdown */}
        <div className="grid gap-3 md:hidden">
          {paginated.length ? (
            paginatedWithDate.map((row, index) => {
              if (row.type === "date") {
                // Separator (mobile): date grouping label
                return (
                  <div
                    key={`${row.date}-${index}`}
                    className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-slate-600"
                  >
                    {formatDateLabel(row.date)}
                  </div>
                );
              }

              const item = row.item;
              const isExpanded = expandedKey === item.key;
              const flag = flagFromCountryCode(item.countryCode);
              return (
                <div
                  key={item.key}
                  className={`rounded-xl border border-slate-200 p-4 shadow-sm ${item.impact >= 3 ? "bg-blue-300/30" : "bg-white"}`}
                >
                  {/* Dropdown trigger (mobile): tap card header */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.key)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                    aria-expanded={isExpanded}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold tabular-nums text-slate-900">
                          {item.time}
                        </span>
                        {flag ? (
                          <span className={`fi fi-${flag} h-4 w-5 rounded`} />
                        ) : (
                          <span
                            className="h-4 w-5 rounded bg-slate-200"
                            aria-hidden="true"
                          />
                        )}
                        <span className="text-[11px] font-bold text-slate-600">
                          {item.currency || "-"}
                        </span>
                      </div>
                      <div className="mt-1 font-bold text-slate-800 leading-snug">
                        {item.title}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <ImpactStars value={item.impact} />
                      <i
                        className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </button>

                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 font-semibold">
                    <span>
                      {t.columns.previous}:{" "}
                      <span className="text-slate-700 font-medium">
                        {item.previous || "—"}
                      </span>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>
                      {t.columns.forecast}:{" "}
                      <span className="text-slate-700 font-medium">
                        {item.forecast || "—"}
                      </span>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>
                      {t.columns.actual}:{" "}
                      <span className="font-bold text-slate-800">
                        {item.actual || "—"}
                      </span>
                    </span>
                  </div>

                  {/* Dropdown content (mobile): expanded details */}
                  {isExpanded ? (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-3">
                        {renderDetailsBlock(
                          t.details.sources,
                          item.details?.sources,
                        )}
                        {renderDetailsBlock(
                          t.details.measures,
                          item.details?.measures,
                        )}
                        {renderDetailsBlock(
                          t.details.usualEffect,
                          item.details?.usualEffect,
                        )}
                        {renderDetailsBlock(
                          t.details.frequency,
                          item.details?.frequency,
                        )}
                        {renderDetailsBlock(
                          t.details.nextRelease,
                          item.details?.nextRelease,
                          t.empty.noInformation,
                        )}
                        {renderDetailsBlock(
                          t.details.notes,
                          item.details?.notes,
                        )}
                        {renderDetailsBlock(
                          t.details.whyCare,
                          item.details?.whyCare,
                        )}
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className="w-full table-fixed text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                              {[
                                t.columns.history,
                                t.columns.previous,
                                t.columns.forecast,
                                t.columns.actual,
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="py-2 px-2 font-bold text-slate-800 text-center"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(item.details?.history?.length
                              ? item.details.history
                              : [
                                  {
                                    date: "—",
                                    previous: item.previous || "—",
                                    forecast: item.forecast || "—",
                                    actual: item.actual || "—",
                                  },
                                ]
                            ).map((hist, idx) => (
                              <tr
                                key={`${hist.date}-${idx}`}
                                className="border-b border-slate-100 last:border-0"
                              >
                                <td className="py-2 px-2 text-slate-600 text-center">
                                  {hist.date}
                                </td>
                                <td className="py-2 px-2 text-slate-600 text-center">
                                  {hist.previous || "—"}
                                </td>
                                <td className="py-2 px-2 text-slate-600 text-center">
                                  {hist.forecast || "—"}
                                </td>
                                <td
                                  className={classNames(
                                    "py-2 px-2 text-center font-bold",
                                    (hist.actual ?? "").includes("-")
                                      ? "text-rose-500"
                                      : "text-emerald-600",
                                  )}
                                >
                                  {hist.actual || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">
              {hasError ? t.empty.notFound : t.empty.noData}
            </div>
          )}
        </div>

        {/* Data body (desktop): table + date separators + dropdown */}
        <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[860px] border-collapse">
            <thead className="bg-slate-50">
              {/* Header row */}
              <tr className="border-b border-slate-200 text-sm font-bold text-slate-600">
                {showDate ? (
                  <th className="py-3.5 px-3 text-left">{t.columns.date}</th>
                ) : null}
                <th className="py-3.5 px-3 text-left">{t.columns.time}</th>
                <th className="py-3.5 px-3 text-left">{t.columns.currency}</th>
                <th className="py-3.5 px-3 text-center">{t.columns.impact}</th>
                <th className="py-3.5 px-3 text-left">{t.columns.event}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWithDate.length ? (
                paginatedWithDate.map((row, index) => {
                  if (row.type === "date") {
                    const colSpan = showDate ? 6 : 5;
                    // Separator (desktop): date grouping row
                    return (
                      <tr key={`${row.date}-${index}`} className="bg-white">
                        <td
                          colSpan={colSpan}
                          className="py-1.5 px-3 font-bold uppercase tracking-[0.18em] text-slate-600 bg-blue-50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-200 w-full h-0.5 rounded-full" />
                            <span className="text-nowrap text-blue-500 text-[10px] font-bold">
                              {formatDateLabel(row.date)}
                            </span>
                            <div className="bg-blue-200 w-full h-0.5 rounded-full" />
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const item = row.item;
                  const isExpanded = expandedKey === item.key;
                  const flag = flagFromCountryCode(item.countryCode);
                  const actualClass = item.actual?.includes("-")
                    ? "text-rose-500"
                    : "text-emerald-600";
                  const HighImpactBg =
                    item.impact >= 3
                      ? "bg-blue-300/30 hover:bg-blue-400/30"
                      : "hover:bg-slate-50/70";

                  return (
                    <React.Fragment key={item.key}>
                      {/* Data row */}

                      <tr
                        className={`border-b border-slate-200 last:border-0  cursor-pointer ${HighImpactBg} transition-all`}
                        onClick={() => toggleExpanded(item.key)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleExpanded(item.key);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-expanded={isExpanded}
                      >
                        {showDate ? (
                          <td className="py-3.5 px-3 text-sm text-slate-700 tabular-nums">
                            {item.date ? formatDateLabel(item.date) : "—"}
                          </td>
                        ) : null}

                        <td className="py-3.5 px-3 text-sm text-slate-800 tabular-nums">
                          {item.time}
                        </td>
                        <td className="py-3.5 px-3 text-sm">
                          <span className="inline-flex items-center gap-2 text-slate-700">
                            {flag ? (
                              <span
                                className={`fi fi-${flag} h-4 w-5 rounded`}
                              />
                            ) : (
                              <i className="fa-solid fa-globe text-[11px] text-slate-400" />
                            )}
                            {item.currency || "-"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <ImpactStars value={item.impact} />
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-sm text-slate-800 mb-1 leading-snug">
                            {item.title}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-black font-semibold">
                            <span>
                              {t.columns.previous}:{" "}
                              <span className="text-slate-700 font-medium">
                                {item.previous || "—"}
                              </span>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>
                              {t.columns.forecast}:{" "}
                              <span className="text-slate-700 font-medium">
                                {item.forecast || "—"}
                              </span>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>
                              {t.columns.actual}:{" "}
                              <span className={`font-bold ${actualClass}`}>
                                {item.actual || "—"}
                              </span>
                            </span>
                          </div>
                        </td>
                      </tr>
                      {/* Dropdown content: expanded details */}
                      {isExpanded ? (
                        <tr className="bg-slate-50/50">
                          <td
                            colSpan={showDate ? 6 : 5}
                            className="p-4 border-b border-slate-200"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="border border-blue-200 bg-blue-50/30 rounded-md p-4 space-y-3">
                                {renderDetailsBlock(
                                  t.details.sources,
                                  item.details?.sources,
                                )}
                                {renderDetailsBlock(
                                  t.details.measures,
                                  item.details?.measures,
                                )}
                                {renderDetailsBlock(
                                  t.details.usualEffect,
                                  item.details?.usualEffect,
                                )}
                                {renderDetailsBlock(
                                  t.details.frequency,
                                  item.details?.frequency,
                                )}
                                {renderDetailsBlock(
                                  t.details.nextRelease,
                                  item.details?.nextRelease,
                                  t.empty.noInformation,
                                )}
                                {renderDetailsBlock(
                                  t.details.notes,
                                  item.details?.notes,
                                )}
                                {renderDetailsBlock(
                                  t.details.whyCare,
                                  item.details?.whyCare,
                                )}
                              </div>

                              {/* Nested table (inside dropdown): history */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm min-w-[420px]">
                                  <thead>
                                    <tr className="border-b border-slate-200">
                                      {[
                                        t.columns.history,
                                        t.columns.previous,
                                        t.columns.forecast,
                                        t.columns.actual,
                                      ].map((h) => (
                                        <th
                                          key={h}
                                          className="py-2 px-2 font-bold text-slate-800 text-center"
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(item.details?.history?.length
                                      ? item.details.history
                                      : [
                                          {
                                            date: "—",
                                            previous: item.previous || "—",
                                            forecast: item.forecast || "—",
                                            actual: item.actual || "—",
                                          },
                                        ]
                                    ).map((hist, idx) => (
                                      <tr
                                        key={`${hist.date}-${idx}`}
                                        className="border-b border-slate-100 last:border-0"
                                      >
                                        <td className="py-2 px-2 text-slate-600 text-center">
                                          {hist.date}
                                        </td>
                                        <td className="py-2 px-2 text-slate-600 text-center">
                                          {hist.previous || "—"}
                                        </td>
                                        <td className="py-2 px-2 text-slate-600 text-center">
                                          {hist.forecast || "—"}
                                        </td>
                                        <td
                                          className={classNames(
                                            "py-2 px-2 text-center font-bold",
                                            (hist.actual ?? "").includes("-")
                                              ? "text-rose-500"
                                              : "text-emerald-600",
                                          )}
                                        >
                                          {hist.actual || "—"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={showDate ? 6 : 5}
                    className="py-10 px-3 text-center text-sm font-semibold text-slate-500"
                  >
                    {/* Empty state: table shown but no rows from API */}
                    {hasError ? t.empty.notFound : t.empty.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.blur();
                shouldScrollRef.current = true;
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-700 cursor-pointer disabled:cursor-not-allowed"
            >
              <i
                className="fa-solid fa-arrow-left text-[11px]"
                aria-hidden="true"
              />
              {t.pagination.prev}
            </button>
            <div className="hidden sm:block text-sm font-semibold text-slate-600">
              {t.pagination.page}{" "}
              <span className="font-extrabold text-slate-900">{page}</span>{" "}
              {t.pagination.of}{" "}
              <span className="font-extrabold text-slate-900">
                {totalPages}
              </span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.blur();
                shouldScrollRef.current = true;
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-700 cursor-pointer disabled:cursor-not-allowed"
            >
              {t.pagination.next}
              <i
                className="fa-solid fa-arrow-right text-[11px]"
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
