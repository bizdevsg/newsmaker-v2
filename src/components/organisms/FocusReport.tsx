import React from "react";
import { Card } from "../atoms/Card";
import { Button } from "../atoms/Button";
import type { Messages } from "@/locales";

type FocusReportProps = {
  messages: Messages;
};

export function FocusReport({ messages }: FocusReportProps) {
  return (
    <Card as="section" className="p-6">
      <div className="rounded-md bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          {messages.focusReport.kicker}
        </p>
        <h3 className="mt-3 text-2xl font-semibold">
          {messages.focusReport.title}
        </h3>
        <p className="mt-2 text-sm text-white/70">
          {messages.focusReport.subtitle}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 border-white/40 text-white"
        >
          {messages.focusReport.ctaLabel}
        </Button>
      </div>
      <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
        <div className="divide-y divide-slate-200">
          {messages.focusReport.metrics.map((metric) => {
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
                key={metric.key}
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
    </Card>
  );
}


