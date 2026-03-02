import React from "react";
import { Button } from "../atoms/Button";

const metrics = [
  {
    label: "IHSG",
    value: "7,150",
    delta: "+0.68%",
    tone: "up" as const,
    meta: "AS 04:44, 00024",
  },
  {
    label: "USD",
    value: "15,680",
    delta: "+6.92%",
    tone: "up" as const,
    meta: "USD/IDR 20",
  },
  {
    label: "Gold",
    value: "1,254,000",
    delta: "+0.32%",
    tone: "up" as const,
    meta: "FT 18:20",
  },
  {
    label: "Oil",
    value: "83.20",
    delta: "-0.15%",
    tone: "down" as const,
    meta: "FT 18:20",
  },
];

export function FocusReport() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="rounded-md bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Indonesia Focus Report
        </p>
        <h3 className="mt-3 text-2xl font-semibold">
          Indonesia Market Outlook 2026
        </h3>
        <p className="mt-2 text-sm text-white/70">
          Quarterly institutional brief with policy and liquidity insights.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 border-white/40 text-white"
        >
          View Report
        </Button>
      </div>
      <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
        <div className="divide-y divide-slate-200">
          {metrics.map((metric) => {
            const toneClass =
              metric.tone === "up"
                ? "text-emerald-600"
                : metric.tone === "down"
                  ? "text-rose-600"
                  : "text-slate-500";

            const initials = metric.label
              .split(/[^A-Za-z0-9]+/)
              .filter(Boolean)
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={metric.label}
                className="flex items-center justify-between gap-4 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-blue-700">
                    {initials}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {metric.label}
                    </p>
                    <p className="text-base font-semibold text-slate-800">
                      {metric.value}
                    </p>
                    <p className="text-[11px] text-slate-400">{metric.meta}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold ${toneClass}`}>
                    {metric.delta}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


