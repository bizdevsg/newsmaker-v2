import React from "react";
import { InsightHeroCard } from "../molecules/InsightHeroCard";
import { SnapshotPanel } from "../molecules/SnapshotPanel";

type SnapshotRow = {
  label: string;
  value: string;
  tone: "up" | "down";
};

type InsightSnapshotSectionProps = {
  insightKicker: string;
  insightTitle: string;
  insightBody: string;
  insightCta: string;
  snapshotTitle: string;
  snapshotHeadline: string;
  snapshotTabs: string[];
  snapshotActiveTab: string;
  snapshotRows: SnapshotRow[];
  snapshotCta: string;
};

export function InsightSnapshotSection({
  insightKicker,
  insightTitle,
  insightBody,
  insightCta,
  snapshotTitle,
  snapshotHeadline,
  snapshotTabs,
  snapshotActiveTab,
  snapshotRows,
  snapshotCta,
}: InsightSnapshotSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <InsightHeroCard
        kicker={insightKicker}
        title={insightTitle}
        body={insightBody}
        ctaLabel={insightCta}
        backgroundImage="/assets/tourism-guangzhou-rivers-city-river.jpg"
      />

      <SnapshotPanel
        title={snapshotTitle}
        headline={snapshotHeadline}
        tabs={snapshotTabs}
        activeTab={snapshotActiveTab}
        rows={snapshotRows}
        ctaLabel={snapshotCta}
      />
    </section>
  );
}
