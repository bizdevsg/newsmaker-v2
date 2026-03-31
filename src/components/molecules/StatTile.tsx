import React from "react";

type StatTileProps = {
  label: string;
  value: string;
  delta?: string;
  tone?: "up" | "down" | "flat";
};

export function StatTile({
  label,
  value,
  delta,
  tone = "flat",
}: StatTileProps) {
  const pillClass =
    tone === "up"
      ? "bg-green-200 text-green-800"
      : tone === "down"
        ? "bg-rose-50 text-rose-600"
        : "bg-slate-100 text-slate-500";
  const initials = label
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-800">
        {initials || label.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex flex-1 gap-1 items-center justify-between">
        <div className="flex flex-col items-baseline">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-800/70">
            {label}
          </p>
          <p className="text-lg font-semibold text-slate-800">{value}</p>
        </div>
        {delta ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pillClass}`}
          >
            {delta}
          </span>
        ) : null}
      </div>
    </div>
  );
}
