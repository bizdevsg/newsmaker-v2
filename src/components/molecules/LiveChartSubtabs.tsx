import React from "react";
import { PillButton } from "../atoms/PillButton";

type LiveChartSubtabsProps = {
  subtabs: string[];
  activeSubtab: string;
};

export function LiveChartSubtabs({
  subtabs,
  activeSubtab,
}: LiveChartSubtabsProps) {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
      {subtabs.map((tab) => (
        <PillButton key={tab} active={tab === activeSubtab}>
          {tab}
        </PillButton>
      ))}
    </div>
  );
}
