import React from "react";
import { StatItem } from "../atoms/StatItem";

type LiveChartStat = {
  label: string;
  value: string;
};

type LiveChartStatsGridProps = {
  stats: LiveChartStat[];
};

export function LiveChartStatsGrid({ stats }: LiveChartStatsGridProps) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <StatItem key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}
