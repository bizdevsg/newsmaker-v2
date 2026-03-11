"use client";

import React, { useEffect, useState } from "react";
const cityTimes = [
  { label: "JKT", timeZone: "Asia/Jakarta" },
  { label: "TKY", timeZone: "Asia/Tokyo" },
  { label: "HK", timeZone: "Asia/Hong_Kong" },
  { label: "NY", timeZone: "America/New_York" },
];

type WorldTimeBarProps = {
  className?: string;
  tone?: "dark" | "light";
  compact?: boolean;
  containerClassName?: string;
};

export function WorldTimeBar({
  className,
  tone = "dark",
  compact = false,
  containerClassName,
}: WorldTimeBarProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const formatDate = (date: Date | null, timeZone: string) => {
    if (!date) return "---";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone,
    }).format(date);
  };

  const formatTime = (date: Date | null, timeZone: string) => {
    if (!date) return "--.--";
    const parts = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }).formatToParts(date);
    const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
    const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
    return `${hour}.${minute}`;
  };

  const dateLabel = formatDate(now, "Asia/Jakarta");

  const timeItems = cityTimes.map((city) => ({
    label: city.label,
    value: formatTime(now, city.timeZone),
  }));

  const toneClasses =
    tone === "light"
      ? {
          wrapper: "bg-slate-100 text-slate-600",
          strong: "text-slate-900 font-bold",
          divider: "text-slate-400",
        }
      : {
          wrapper:
            "bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 text-white",
          strong: "text-white/90 font-bold",
          divider: "text-white/50",
        };

  const rowClass = compact
    ? "mx-auto flex max-w-none flex-wrap items-center gap-x-3 gap-y-2 py-2 text-[9px] uppercase tracking-[0.18em]"
    : "mx-auto flex max-w-7xl flex-wrap items-center gap-3 py-2 text-[10px] uppercase tracking-[0.2em] sm:text-[11px]";

  return (
    <div className={`${toneClasses.wrapper} ${className ?? ""}`.trim()}>
      <div className={`px-4 ${containerClassName ?? ""}`.trim()}>
        <div className={rowClass}>
          <span className={`whitespace-nowrap ${toneClasses.strong}`.trim()}>
            {dateLabel}
          </span>
          <span className={toneClasses.divider}>|</span>
          {timeItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <span className="whitespace-nowrap">
                <span className={toneClasses.strong}>{item.label}</span>{" "}
                <span>{item.value}</span>
              </span>
              {index < timeItems.length - 1 && (
                <span className={toneClasses.divider}>|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
