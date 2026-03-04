import React from "react";
import { IconBadge } from "../atoms/IconBadge";

type SnapshotCardProps = {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  meta: string;
};

export function SnapshotCard({
  icon,
  title,
  value,
  subtitle,
  meta,
}: SnapshotCardProps) {
  return (
    <div className="flex h-full gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="shrink-0">
        <IconBadge label={icon} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
        <p className="text-lg font-bold text-slate-800 leading-tight break-words hyphens-auto">{value}</p>
        <p className="text-xs text-slate-500 break-words leading-snug">{subtitle}</p>
        <p className="text-[11px] text-slate-400 mt-auto pt-1">{meta}</p>
      </div>
    </div>
  );
}


