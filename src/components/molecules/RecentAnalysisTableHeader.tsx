import React from "react";

export function RecentAnalysisTableHeader() {
  return (
    <div className="grid grid-cols-2 gap-x-4 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:grid-cols-[1fr_repeat(4,_minmax(0,_1fr))]">
      <span className="hidden sm:block">Summary</span>
      <span>Change</span>
      <span>Value</span>
      <span>Volume</span>
      <span>Score</span>
    </div>
  );
}
