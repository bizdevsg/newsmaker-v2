import React from "react";
import { Card } from "../atoms/Card";

type LiveChartStat = {
  label: string;
  value: string;
};

type LiveChartPanelProps = {
  title: string;
  tabs: string[];
  activeTab: string;
  subtabs: string[];
  activeSubtab: string;
  stats: LiveChartStat[];
  imageSrc: string;
  imageAlt: string;
};

export function LiveChartPanel({
  title,
  tabs,
  activeTab,
  subtabs,
  activeSubtab,
  stats,
  imageSrc,
  imageAlt,
}: LiveChartPanelProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded-full px-3 py-1 ${
                tab === activeTab
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-6 pt-4 sm:px-6">
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {subtabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded-md px-3 py-1 ${
                tab === activeSubtab
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
            >
              <p className="font-semibold text-slate-700">{stat.label}</p>
              <p className="text-slate-500">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
          <img src={imageSrc} alt={imageAlt} className="h-72 w-full object-cover" />
        </div>
      </div>
    </Card>
  );
}
