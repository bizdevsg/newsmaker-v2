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
  return (
    <div className="animate-in fade-in duration-500 w-full overflow-hidden min-w-0">
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar max-w-full">
        {["today", "this-week", "previous-week", "next-week"].map((tf) => (
          <button
            key={tf}
            onClick={() =>
              onTimeFrameChange(
                tf as "today" | "this-week" | "previous-week" | "next-week",
              )
            }
            className={`px-5 py-2 text-sm font-semibold rounded border transition whitespace-nowrap ${calendarTimeFrame === tf ? "bg-blue-700 text-white border-blue-700" : "bg-white text-blue-700 border-blue-700 hover:bg-blue-50"}`}
          >
            {tf
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm text-slate-600 min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-3 px-2 text-xs font-bold text-slate-800 w-[15%]">
                Date
              </th>
              <th className="py-3 px-2 text-xs font-bold text-slate-800 w-[10%]">
                Time
              </th>
              <th className="py-3 px-2 text-xs font-bold text-slate-800 w-[10%]">
                Country
              </th>
              <th className="py-3 px-2 text-xs font-bold text-slate-800 text-center w-[15%]">
                Impact
              </th>
              <th className="py-3 px-2 text-xs font-bold text-slate-800 w-[50%]">
                Figures
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCalendarData.map((item, idx, list) => {
              const formatDateLabel = (value: string) => {
                const raw = value.trim();
                if (!raw) return "";
                let year = 0;
                let month = 0;
                let day = 0;

                if (raw.includes("-")) {
                  const parts = raw.split("-");
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

                if (!year || !month || !day) return raw;
                const date = new Date(Date.UTC(year, month - 1, day));
                return new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(date);
              };

              let dateStr = "";
              let timeStr = item.time;
              if (item.time && item.time.includes(" ")) {
                const parts = item.time.split(" ");
                dateStr = parts[0].split("-").reverse().join("-");
                timeStr = parts.slice(1).join(" ");
              } else if (item.details?.history?.[0]?.date) {
                dateStr = item.details.history[0].date
                  .split("-")
                  .reverse()
                  .join("-");
              }

              const isExpanded = expandedRow === idx;
              const prevItem = list[idx - 1];
              const prevDate = prevItem
                ? (() => {
                    if (prevItem.time && prevItem.time.includes(" ")) {
                      return prevItem.time
                        .split(" ")[0]
                        .split("-")
                        .reverse()
                        .join("-");
                    }
                    if (prevItem.details?.history?.[0]?.date) {
                      return prevItem.details.history[0].date
                        .split("-")
                        .reverse()
                        .join("-");
                    }
                    return "";
                  })()
                : "";
              const showSeparator =
                calendarTimeFrame !== "today" &&
                idx !== 0 &&
                dateStr &&
                dateStr !== prevDate;
              const dateLabel = dateStr ? formatDateLabel(dateStr) : "";

              const impactRaw =
                typeof item.impact === "string"
                  ? item.impact
                  : String(item.impact ?? "");
              const starCount = (impactRaw.match(/\u2605/g) || []).length;
              const normalizedImpact = impactRaw.replace(/\s+/g, "");
              const isHighImpact =
                starCount >= 3 ||
                normalizedImpact.toLowerCase().includes("high") ||
                normalizedImpact === "3";

              return (
                <React.Fragment key={idx}>
                  {showSeparator ? (
                    <tr>
                      <td colSpan={5} className="bg-slate-100 py-2 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-blue-200" />
                          <span className="text-xs font-semibold text-blue-500">
                            {dateLabel}
                          </span>
                          <div className="h-px flex-1 bg-blue-200" />
                        </div>
                      </td>
                    </tr>
                  ) : null}
                  <tr
                    onClick={() => onToggleRow(isExpanded ? -1 : idx)}
                    className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition align-top cursor-pointer ${isExpanded ? "bg-slate-50" : ""} ${isHighImpact ? "bg-rose-50" : ""}`}
                  >
                    <td className="py-4 px-2 text-[13px]">
                      {dateLabel || dateStr}
                    </td>
                    <td className="py-4 px-2 text-[13px]">{timeStr}</td>
                    <td className="py-4 px-2 text-[13px]">{item.currency}</td>
                    <td className="py-4 px-2 text-center text-[13px]">
                      <span className="text-[10px] space-x-0.5">
                        {starCount >= 3 && (
                          <span className="text-rose-500">
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                          </span>
                        )}
                        {starCount === 2 && (
                          <span className="text-amber-500">
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                          </span>
                        )}
                        {starCount === 1 && (
                          <span className="text-emerald-500">
                            <i className="fa-solid fa-star"></i>
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-[13px]">
                      <div className="font-bold text-slate-800 mb-1">
                        {item.event}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold gap-1 inline-flex">
                        <span>
                          Previous:{" "}
                          <span className="text-slate-700 font-medium">
                            {item.previous || "-"}
                          </span>
                        </span>
                        <span className="mx-1">|</span>
                        <span>
                          Forecast:{" "}
                          <span className="text-slate-700 font-medium">
                            {item.forecast || "-"}
                          </span>
                        </span>
                        <span className="mx-1">|</span>
                        <span className="flex items-center gap-1">
                          Actual:{" "}
                          <span
                            className={`font-bold ${item.actual?.includes("-") ? "text-rose-500" : "text-emerald-500"}`}
                          >
                            {item.actual || "-"}
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
                            <div>
                              <div className="font-bold text-slate-800 text-[13px]">
                                Sources
                              </div>
                              <div className="text-slate-600 text-xs">
                                {item.details.sources || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[13px]">
                                Measures
                              </div>
                              <div className="text-slate-600 text-xs">
                                {item.details.measures || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[13px]">
                                Usual Effect
                              </div>
                              <div className="text-slate-600 text-xs">
                                {item.details.usualEffect || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[13px]">
                                Frequency
                              </div>
                              <div className="text-slate-600 text-xs">
                                {item.details.frequency || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[13px]">
                                Next Released
                              </div>
                              <div className="text-slate-600 text-xs">
                                {item.details.nextRelease || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[13px]">
                                Notes
                              </div>
                              <div className="text-slate-600 text-xs">
                                {item.details.notes || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[13px]">
                                Why Trader Care
                              </div>
                              <div className="text-slate-600 text-xs">
                                {item.details.whyCare || "-"}
                              </div>
                            </div>
                          </div>
                          <div>
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-200">
                                  <th className="py-2 px-1 font-bold text-slate-800 text-center">
                                    History
                                  </th>
                                  <th className="py-2 px-1 font-bold text-slate-800 text-center">
                                    Previous
                                  </th>
                                  <th className="py-2 px-1 font-bold text-slate-800 text-center">
                                    Forecast
                                  </th>
                                  <th className="py-2 px-1 font-bold text-slate-800 text-center">
                                    Actual
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.details.history?.map(
                                  (hist: any, hIdx: number) => (
                                    <tr
                                      key={hIdx}
                                      className="border-b border-slate-100 last:border-0"
                                    >
                                      <td className="py-2 px-1 text-slate-600 text-center">
                                        {hist.date}
                                      </td>
                                      <td className="py-2 px-1 text-slate-600 text-center">
                                        {hist.previous || "-"}
                                      </td>
                                      <td className="py-2 px-1 text-slate-600 text-center">
                                        {hist.forecast || "-"}
                                      </td>
                                      <td className="py-2 px-1 text-slate-600 text-center">
                                        {hist.actual || "-"}
                                      </td>
                                    </tr>
                                  ),
                                )}
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
