import React from "react";
import { Card } from "../atoms/Card";

type SnapshotRow = {
  label: string;
  value: string;
  tone: "up" | "down";
};

type SnapshotPanelProps = {
  title: string;
  headline: string;
  tabs: string[];
  activeTab: string;
  rows: SnapshotRow[];
  ctaLabel: string;
  ctaHref?: string;
};

export function SnapshotPanel({
  title,
  headline,
  tabs,
  activeTab,
  rows,
  ctaLabel,
  ctaHref = "#",
}: SnapshotPanelProps) {
  return (
    <Card>
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <span className="text-xs font-semibold text-emerald-600">
            {headline}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded-full px-2 py-1 ${
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
      <div className="divide-y divide-slate-100 px-5 py-4 text-sm sm:px-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2"
          >
            <span className="text-slate-700">{row.label}</span>
            <span
              className={`text-xs font-semibold ${
                row.tone === "up" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
        <a
          href={ctaHref}
          className="block rounded-md bg-blue-700 px-3 py-2 text-center text-xs font-semibold text-white"
        >
          {ctaLabel}
        </a>
      </div>
    </Card>
  );
}
