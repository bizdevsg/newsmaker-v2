import React from "react";
import { Card } from "../atoms/Card";

type CalendarRow = {
  time: string;
  label: string;
};

type CalendarCardProps = {
  title: string;
  rows: CalendarRow[];
  ctaLabel: string;
  ctaHref?: string;
};

export function CalendarCard({
  title,
  rows,
  ctaLabel,
  ctaHref = "#",
}: CalendarCardProps) {
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-3 space-y-3 text-sm text-slate-600">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-20 text-xs font-semibold text-slate-500">
              {row.time}
            </span>
            <span className="text-sm font-medium text-slate-700">
              {row.label}
            </span>
          </div>
        ))}
      </div>
      <a
        href={ctaHref}
        className="mt-4 block rounded-md bg-blue-700 px-3 py-2 text-center text-xs font-semibold text-white"
      >
        {ctaLabel}
      </a>
    </Card>
  );
}
