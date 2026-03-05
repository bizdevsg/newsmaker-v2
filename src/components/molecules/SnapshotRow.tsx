import React from "react";

type SnapshotRowProps = {
  label: string;
  value: string;
  trendIconClass?: string;
  ctaHref?: string;
};

export function SnapshotRow({
  label,
  value,
  trendIconClass = "fa-solid fa-caret-up",
  ctaHref = "#",
}: SnapshotRowProps) {
  return (
    <div className="px-2 py-2 border-b border-zinc-200 last:border-b-0">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{label}</h3>
        <div className="flex items-center gap-2">
          <p className="text-green-700">
            <i className={trendIconClass}></i> {value}
          </p>
          <a href={ctaHref}>
            <i className="fa-solid fa-arrow-right text-blue-500"></i>
          </a>
        </div>
      </div>
    </div>
  );
}
