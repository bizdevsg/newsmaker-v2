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
    <div className="flex h-full gap-4 rounded border border-slate-200 bg-white p-4 shadow-sm">
      <IconBadge label={icon} />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xl font-semibold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
        <p className="text-xs text-slate-400">{meta}</p>
      </div>
    </div>
  );
}


