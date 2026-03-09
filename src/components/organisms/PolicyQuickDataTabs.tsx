"use client";

import React from "react";
import type { Messages } from "@/locales";

type PolicyQuickDataTabsProps = {
  activeTab: string;
  onChange: (tab: string) => void;
  quickData: Messages["policy"]["quickData"];
};

export function PolicyQuickDataTabs({
  activeTab,
  onChange,
  quickData,
}: PolicyQuickDataTabsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 mb-6 border-b border-slate-200">
      <button
        onClick={() => onChange("calendar")}
        className={`flex flex-col items-center justify-center rounded-md py-6 px-2 text-center shadow-sm border transition group cursor-pointer ${activeTab === "calendar" ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-100" : "bg-slate-50/70 border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200"}`}
      >
        <div
          className={`mb-4 transition-all duration-300 ${activeTab === "calendar" ? "text-blue-600 scale-110" : "text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110"}`}
        >
          <i className="fa-regular fa-circle-check text-4xl"></i>
        </div>
        <span
          className={`text-xs sm:text-sm font-semibold transition-colors ${activeTab === "calendar" ? "text-blue-900" : "text-slate-700 group-hover:text-blue-900"}`}
        >
          {quickData.actions.economicCalendar}
        </span>
      </button>
      <button
        onClick={() => onChange("fibonacci")}
        className={`flex flex-col items-center justify-center rounded-md py-6 px-2 text-center shadow-sm border transition group cursor-pointer ${activeTab === "fibonacci" ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-100" : "bg-slate-50/70 border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200"}`}
      >
        <div
          className={`mb-4 transition-all duration-300 ${activeTab === "fibonacci" ? "text-blue-600 scale-110" : "text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110"}`}
        >
          <i className="fa-regular fa-calendar-days text-4xl"></i>
        </div>
        <span
          className={`text-xs sm:text-sm font-semibold transition-colors ${activeTab === "fibonacci" ? "text-blue-900" : "text-slate-700 group-hover:text-blue-900"}`}
        >
          {quickData.actions.pivotFibonacci}
        </span>
      </button>
      <button
        onClick={() => onChange("liveChart")}
        className={`flex flex-col items-center justify-center rounded-md py-6 px-2 text-center shadow-sm border transition group cursor-pointer ${activeTab === "liveChart" ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-100" : "bg-slate-50/70 border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200"}`}
      >
        <div
          className={`mb-4 transition-all duration-300 ${activeTab === "liveChart" ? "text-blue-600 scale-110" : "text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110"}`}
        >
          <i className="fa-solid fa-chart-line text-4xl"></i>
        </div>
        <span
          className={`text-xs sm:text-sm font-semibold transition-colors ${activeTab === "liveChart" ? "text-blue-900" : "text-slate-700 group-hover:text-blue-900"}`}
        >
          {quickData.actions.liveChart}
        </span>
      </button>
      <button
        onClick={() => onChange("historic")}
        className={`flex flex-col items-center justify-center rounded-md py-6 px-2 text-center shadow-sm border transition group cursor-pointer ${activeTab === "historic" ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-100" : "bg-slate-50/70 border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200"}`}
      >
        <div
          className={`mb-4 transition-all duration-300 ${activeTab === "historic" ? "text-blue-600 scale-110" : "text-blue-600/80 group-hover:text-blue-600 group-hover:scale-110"}`}
        >
          <i className="fa-solid fa-chart-area text-4xl"></i>
        </div>
        <span
          className={`text-xs sm:text-sm font-semibold transition-colors ${activeTab === "historic" ? "text-blue-900" : "text-slate-700 group-hover:text-blue-900"}`}
        >
          {quickData.actions.historic}
        </span>
      </button>
    </div>
  );
}
