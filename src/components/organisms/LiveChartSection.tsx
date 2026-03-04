import React from "react";
import { LiveChartPanel } from "../molecules/LiveChartPanel";
import { IconGridCard } from "../molecules/IconGridCard";
import { CalendarCard } from "../molecules/CalendarCard";

type CalendarRow = {
  time: string;
  label: string;
};

type LiveChartStat = {
  label: string;
  value: string;
};

type LiveChartSectionProps = {
  liveChartTitle: string;
  liveChartTabs: string[];
  liveChartActiveTab: string;
  liveChartSubtabs: string[];
  liveChartActiveSubtab: string;
  liveChartStats: LiveChartStat[];
  quotesTitle: string;
  quotesItems: string[];
  quickTitle: string;
  quickItems: string[];
  calendarTitle: string;
  calendarRows: CalendarRow[];
  calendarCta: string;
};

export function LiveChartSection({
  liveChartTitle,
  liveChartTabs,
  liveChartActiveTab,
  liveChartSubtabs,
  liveChartActiveSubtab,
  liveChartStats,
  quotesTitle,
  quotesItems,
  quickTitle,
  quickItems,
  calendarTitle,
  calendarRows,
  calendarCta,
}: LiveChartSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <LiveChartPanel
        title={liveChartTitle}
        tabs={liveChartTabs}
        activeTab={liveChartActiveTab}
        subtabs={liveChartSubtabs}
        activeSubtab={liveChartActiveSubtab}
        stats={liveChartStats}
        imageSrc="/assets/Screenshot-2024-10-29-at-11.27.48.png"
        imageAlt="Live chart placeholder"
      />
      <div className="flex flex-col gap-6">
        <IconGridCard
          title={quotesTitle}
          items={quotesItems}
          iconClass="fa-regular fa-rectangle-list"
          columns={2}
        />
        <IconGridCard
          title={quickTitle}
          items={quickItems}
          iconClass="fa-solid fa-chart-line"
          columns={3}
        />
        <CalendarCard
          title={calendarTitle}
          rows={calendarRows}
          ctaLabel={calendarCta}
        />
      </div>
    </section>
  );
}
