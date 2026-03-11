"use client";

import React from "react";
import { Pagination } from "../molecules/Pagination";

type PolicyQuickDataCalendarProps = {
  calendarTimeFrame: "today" | "this-week" | "previous-week" | "next-week";
  onTimeFrameChange: (
    value: "today" | "this-week" | "previous-week" | "next-week",
  ) => void;
  paginatedCalendarData: any[];
  calendarPage: number;
  totalCalendarPages: number;
  onPageChange: (page: number) => void;
  expandedRow: number | null;
  onToggleRow: (row: number) => void;
  loopDuration?: never;
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDateLabel(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  let year = 0, month = 0, day = 0;
  if (raw.includes("-")) {
    const parts = raw.split("-");
    if (parts[0].length === 4) {
      year = Number(parts[0]); month = Number(parts[1]); day = Number(parts[2]);
    } else {
      day = Number(parts[0]); month = Number(parts[1]); year = Number(parts[2]);
    }
  }
  if (!year || !month || !day) return raw;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function ImpactStars({ count }: { count: number }) {
  if (count >= 3) return (
    <span className="text-rose-500 text-sm font-bold tracking-tight">
      ★★★
    </span>
  );
  if (count === 2) return (
    <span className="text-amber-500 text-sm font-bold tracking-tight">
      ★★
    </span>
  );
  if (count === 1) return (
    <span className="text-emerald-500 text-sm font-bold tracking-tight">
      ★
    </span>
  );
  return <span className="text-slate-300 text-sm">—</span>;
}

// ── Main ───────────────────────────────────────────────────────────────────
export function PolicyQuickDataCalendar({
  calendarTimeFrame,
  onTimeFrameChange,
  paginatedCalendarData,
  calendarPage,
  totalCalendarPages,
  onPageChange,
  expandedRow,
  onToggleRow,
}: PolicyQuickDataCalendarProps) {

  const TIME_FRAMES = ["today", "this-week", "previous-week", "next-week"] as const;

  return (
    <div className="animate-in fade-in duration-500 w-full overflow-hidden min-w-0">
      {/* ── Time-frame pills ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TIME_FRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeFrameChange(tf)}
            className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full border transition whitespace-nowrap ${calendarTimeFrame === tf
              ? "bg-blue-700 text-white border-blue-700 shadow-sm"
              : "bg-white text-blue-700 border-blue-200 hover:border-blue-700 hover:bg-blue-50"
              }`}
          >
            {tf.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </button>
        ))}
      </div>

      {/* ── MOBILE: card list (< md) ──────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {paginatedCalendarData.length === 0 && (
          <p className="text-center text-slate-400 py-10 text-sm">No data available.</p>
        )}
        {paginatedCalendarData.map((item, idx, list) => {
          let dateStr = "";
          let timeStr = item.time;
          if (item.time?.includes(" ")) {
            const parts = item.time.split(" ");
            dateStr = parts[0].split("-").reverse().join("-");
            timeStr = parts.slice(1).join(" ");
          } else if (item.details?.history?.[0]?.date) {
            dateStr = item.details.history[0].date.split("-").reverse().join("-");
          }

          const impactRaw = String(item.impact ?? "");
          const starCount = (impactRaw.match(/\u2605/g) || []).length;
          const isHighImpact = starCount >= 3 || impactRaw.toLowerCase().includes("high");
          const isExpanded = expandedRow === idx;
          const dateLabel = dateStr ? formatDateLabel(dateStr) : "";

          // Date separator
          const prevItem = list[idx - 1];
          const prevDate = prevItem
            ? (prevItem.time?.includes(" ")
              ? prevItem.time.split(" ")[0].split("-").reverse().join("-")
              : prevItem.details?.history?.[0]?.date?.split("-").reverse().join("-") ?? "")
            : "";
          const showSeparator = calendarTimeFrame !== "today" && idx !== 0 && dateStr && dateStr !== prevDate;

          return (
            <React.Fragment key={idx}>
              {showSeparator && (
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-blue-200" />
                  <span className="text-[11px] font-semibold text-blue-500">{dateLabel}</span>
                  <div className="h-px flex-1 bg-blue-200" />
                </div>
              )}
              <div
                onClick={() => onToggleRow(isExpanded ? -1 : idx)}
                className={`rounded-xl border transition cursor-pointer p-4 space-y-2 ${isHighImpact
                  ? "border-rose-200 bg-rose-50/60"
                  : isExpanded
                    ? "border-blue-200 bg-blue-50/40"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-bold text-slate-800 leading-snug flex-1">
                    {item.event}
                  </div>
                  <ImpactStars count={starCount} />
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium">
                  {dateLabel && (
                    <span className="flex items-center gap-1">
                      <i className="fa-regular fa-calendar text-[10px]" />
                      {dateLabel}
                    </span>
                  )}
                  {timeStr && (
                    <span className="flex items-center gap-1">
                      <i className="fa-regular fa-clock text-[10px]" />
                      {timeStr}
                    </span>
                  )}
                  {item.currency && (
                    <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {item.currency}
                    </span>
                  )}
                </div>

                {/* Figures */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold">
                  <span>
                    Previous: <span className="text-slate-700 font-medium">{item.previous || "—"}</span>
                  </span>
                  <span>
                    Forecast: <span className="text-slate-700 font-medium">{item.forecast || "—"}</span>
                  </span>
                  <span>
                    Actual:{" "}
                    <span className={`font-bold ${item.actual?.includes("-") ? "text-rose-500" : "text-emerald-500"}`}>
                      {item.actual || "—"}
                    </span>
                  </span>
                </div>

                {/* Chevron indicator */}
                <div className="flex justify-end">
                  <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"} text-slate-400 text-[10px]`} />
                </div>
              </div>

              {/* Expanded detail — mobile */}
              {isExpanded && item.details && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 space-y-3 text-xs">
                  {[
                    ["Sources", item.details.sources],
                    ["Measures", item.details.measures],
                    ["Usual Effect", item.details.usualEffect],
                    ["Frequency", item.details.frequency],
                    ["Next Released", item.details.nextRelease],
                    ["Notes", item.details.notes],
                    ["Why Traders Care", item.details.whyCare],
                  ].map(([label, value]) => value ? (
                    <div key={label as string}>
                      <div className="font-bold text-slate-700 mb-0.5">{label}</div>
                      <div className="text-slate-500">{value}</div>
                    </div>
                  ) : null)}

                  {item.details.history?.length > 0 && (
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left text-[11px] min-w-[280px]">
                        <thead>
                          <tr className="border-b border-slate-200">
                            {["Date", "Previous", "Forecast", "Actual"].map((h) => (
                              <th key={h} className="py-1.5 px-2 font-bold text-slate-700 text-center">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {item.details.history.map((hist: any, hIdx: number) => (
                            <tr key={hIdx} className="border-b border-slate-100 last:border-0">
                              <td className="py-1.5 px-2 text-slate-600 text-center">{hist.date}</td>
                              <td className="py-1.5 px-2 text-slate-600 text-center">{hist.previous || "—"}</td>
                              <td className="py-1.5 px-2 text-slate-600 text-center">{hist.forecast || "—"}</td>
                              <td className="py-1.5 px-2 text-slate-600 text-center">{hist.actual || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── DESKTOP: table (≥ md) ─────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm text-slate-600 min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-3 px-3 text-xs font-bold text-slate-700 w-[16%]">Date</th>
              <th className="py-3 px-3 text-xs font-bold text-slate-700 w-[10%]">Time</th>
              <th className="py-3 px-3 text-xs font-bold text-slate-700 w-[8%]">Country</th>
              <th className="py-3 px-3 text-xs font-bold text-slate-700 text-center w-[12%]">Impact</th>
              <th className="py-3 px-3 text-xs font-bold text-slate-700 w-[54%]">Event & Figures</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCalendarData.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">No data available.</td>
              </tr>
            )}
            {paginatedCalendarData.map((item, idx, list) => {
              let dateStr = "";
              let timeStr = item.time;
              if (item.time?.includes(" ")) {
                const parts = item.time.split(" ");
                dateStr = parts[0].split("-").reverse().join("-");
                timeStr = parts.slice(1).join(" ");
              } else if (item.details?.history?.[0]?.date) {
                dateStr = item.details.history[0].date.split("-").reverse().join("-");
              }

              const isExpanded = expandedRow === idx;
              const prevItem = list[idx - 1];
              const prevDate = prevItem
                ? (prevItem.time?.includes(" ")
                  ? prevItem.time.split(" ")[0].split("-").reverse().join("-")
                  : prevItem.details?.history?.[0]?.date?.split("-").reverse().join("-") ?? "")
                : "";
              const showSeparator = calendarTimeFrame !== "today" && idx !== 0 && dateStr && dateStr !== prevDate;
              const dateLabel = dateStr ? formatDateLabel(dateStr) : "";

              const impactRaw = String(item.impact ?? "");
              const starCount = (impactRaw.match(/\u2605/g) || []).length;
              const isHighImpact = starCount >= 3 || impactRaw.toLowerCase().includes("high");

              return (
                <React.Fragment key={idx}>
                  {showSeparator && (
                    <tr>
                      <td colSpan={5} className="bg-slate-100 py-2 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-blue-200" />
                          <span className="text-xs font-semibold text-blue-500">{dateLabel}</span>
                          <div className="h-px flex-1 bg-blue-200" />
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr
                    onClick={() => onToggleRow(isExpanded ? -1 : idx)}
                    className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition align-top cursor-pointer ${isExpanded ? "bg-slate-50" : ""
                      } ${isHighImpact ? "bg-rose-50/60" : ""}`}
                  >
                    <td className="py-3.5 px-3 text-[13px] text-slate-700">{dateLabel || dateStr}</td>
                    <td className="py-3.5 px-3 text-[13px] text-slate-600 whitespace-nowrap">{timeStr}</td>
                    <td className="py-3.5 px-3 text-[13px]">
                      <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {item.currency}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <ImpactStars count={starCount} />
                    </td>
                    <td className="py-3.5 px-3 text-[13px]">
                      <div className="font-bold text-slate-800 mb-1 leading-snug">{item.event}</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-semibold">
                        <span>Previous: <span className="text-slate-700 font-medium">{item.previous || "—"}</span></span>
                        <span className="text-slate-300">|</span>
                        <span>Forecast: <span className="text-slate-700 font-medium">{item.forecast || "—"}</span></span>
                        <span className="text-slate-300">|</span>
                        <span>
                          Actual:{" "}
                          <span className={`font-bold ${item.actual?.includes("-") ? "text-rose-500" : "text-emerald-500"}`}>
                            {item.actual || "—"}
                          </span>
                        </span>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && item.details && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={5} className="p-4 border-b border-slate-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="border border-blue-200 bg-blue-50/30 rounded-md p-4 space-y-3">
                            {[
                              ["Sources", item.details.sources],
                              ["Measures", item.details.measures],
                              ["Usual Effect", item.details.usualEffect],
                              ["Frequency", item.details.frequency],
                              ["Next Released", item.details.nextRelease],
                              ["Notes", item.details.notes],
                              ["Why Traders Care", item.details.whyCare],
                            ].map(([label, value]) => value ? (
                              <div key={label as string}>
                                <div className="font-bold text-slate-800 text-[13px] mb-0.5">{label}</div>
                                <div className="text-slate-600 text-xs">{value}</div>
                              </div>
                            ) : null)}
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs min-w-[240px]">
                              <thead>
                                <tr className="border-b border-slate-200">
                                  {["History", "Previous", "Forecast", "Actual"].map((h) => (
                                    <th key={h} className="py-2 px-2 font-bold text-slate-800 text-center">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {item.details.history?.map((hist: any, hIdx: number) => (
                                  <tr key={hIdx} className="border-b border-slate-100 last:border-0">
                                    <td className="py-2 px-2 text-slate-600 text-center">{hist.date}</td>
                                    <td className="py-2 px-2 text-slate-600 text-center">{hist.previous || "—"}</td>
                                    <td className="py-2 px-2 text-slate-600 text-center">{hist.forecast || "—"}</td>
                                    <td className="py-2 px-2 text-slate-600 text-center">{hist.actual || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalCalendarPages > 1 && (
        <Pagination
          page={calendarPage}
          totalPages={totalCalendarPages}
          onPageChange={onPageChange}
          className="mt-4"
        />
      )}
    </div>
  );
}
