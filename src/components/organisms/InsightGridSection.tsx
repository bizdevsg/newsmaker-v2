import React from "react";
import { InsightGridCard } from "../molecules/InsightGridCard";

type InsightGridSectionProps = {
  title: string;
  items: string[];
  ctaLabel: string;
  readMoreLabel: string;
};

export function InsightGridSection({
  title,
  items,
  ctaLabel,
  readMoreLabel,
}: InsightGridSectionProps) {
  return (
    <section>
      <InsightGridCard
        title={title}
        items={items}
        ctaLabel={ctaLabel}
        readMoreLabel={readMoreLabel}
        imageSrc="/assets/tourism-guangzhou-rivers-city-river.jpg"
      />
    </section>
  );
}
