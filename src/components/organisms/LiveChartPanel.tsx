import React from "react";
import { Card } from "../atoms/Card";
import { ChartImage } from "../atoms/ChartImage";
import { LiveChartHeader } from "../molecules/LiveChartHeader";
import { LiveChartSubtabs } from "../molecules/LiveChartSubtabs";
import { LiveChartStatsGrid } from "../molecules/LiveChartStatsGrid";

type LiveChartStat = {
  label: string;
  value: string;
};

export type LiveChartPanelProps = {
  title: string;
  tabs: string[];
  activeTab: string;
  subtabs: string[];
  activeSubtab: string;
  stats: LiveChartStat[];
  imageSrc: string;
  imageAlt: string;
};

export function LiveChartPanel({
  title,
  tabs,
  activeTab,
  subtabs,
  activeSubtab,
  stats,
  imageSrc,
  imageAlt,
}: LiveChartPanelProps) {
  return (
    <Card>
      <LiveChartHeader title={title} tabs={tabs} activeTab={activeTab} />
      <div className="px-5 pb-6 pt-4 sm:px-6">
        <LiveChartSubtabs subtabs={subtabs} activeSubtab={activeSubtab} />
        <LiveChartStatsGrid stats={stats} />
        <div className="mt-4">
          <ChartImage src={imageSrc} alt={imageAlt} />
        </div>
      </div>
    </Card>
  );
}
