import React from "react";
import { RecentAnalysisDot } from "../atoms/RecentAnalysisDot";

type RecentAnalysisTableRowProps = {
  title: string;
  subtitle: string;
  change: string;
  value: string;
  volume: string;
  score: string;
  dotClassName?: string;
};

export function RecentAnalysisTableRow({
  title,
  subtitle,
  change,
  value,
  volume,
  score,
  dotClassName = "bg-slate-400",
}: RecentAnalysisTableRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[1fr_repeat(4,_minmax(0,_1fr))] sm:items-center">
      <div className="flex items-start gap-3">
        <RecentAnalysisDot className={dotClassName} />
        <div>
          <div className="text-sm font-semibold text-slate-700">{title}</div>
          <div className="text-xs text-slate-400">{subtitle}</div>
        </div>
      </div>
      <span className="text-xs font-semibold text-emerald-600">{change}</span>
      <span className="text-xs text-slate-500">{value}</span>
      <span className="text-xs text-slate-500">{volume}</span>
      <span className="text-xs text-emerald-600">{score}</span>
    </div>
  );
}
