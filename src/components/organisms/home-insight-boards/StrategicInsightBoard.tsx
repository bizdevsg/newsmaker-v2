import React from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { PanelArticleCard } from "@/components/organisms/home-panels/PanelArticleCard";
import type { StrategicItem } from "./types";

type StrategicInsightBoardProps = {
  items: StrategicItem[];
  readMoreLabel: string;
};

export function StrategicInsightBoard({
  items,
  readMoreLabel,
}: StrategicInsightBoardProps) {
  return (
    <Card>
      <SectionHeader title="Strategic Insight" />
      <div className="grid gap-3 p-4">
        {items.map((item) => (
          <PanelArticleCard
            key={item.key}
            eyebrow={item.eyebrow || undefined}
            title={item.title}
            date={item.date}
            image={item.image}
            ctaLabel={readMoreLabel}
            href={item.href}
          />
        ))}
      </div>
    </Card>
  );
}
