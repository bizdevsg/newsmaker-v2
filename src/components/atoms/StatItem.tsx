import React from "react";

type StatItemProps = {
  label: string;
  value: string;
};

export function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-slate-500">{value}</p>
    </div>
  );
}
