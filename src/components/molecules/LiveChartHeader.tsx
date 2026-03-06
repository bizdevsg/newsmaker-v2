import React from "react";
import { PillButton } from "../atoms/PillButton";

type LiveChartHeaderProps = {
  title: string;
  tabs: string[];
  activeTab: string;
};

export function LiveChartHeader({
  title,
  tabs,
  activeTab,
}: LiveChartHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <div className="flex flex-wrap gap-2 text-xs">
        {tabs.map((tab) => (
          <PillButton key={tab} active={tab === activeTab}>
            {tab}
          </PillButton>
        ))}
      </div>
    </div>
  );
}
