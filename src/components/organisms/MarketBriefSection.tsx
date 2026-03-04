import React from "react";
import { MarketBriefCard } from "../molecules/MarketBriefCard";

type MarketBriefSectionProps = {
  title: string;
  items: string[];
  ctaLabel: string;
};

export function MarketBriefSection({
  title,
  items,
  ctaLabel,
}: MarketBriefSectionProps) {
  return (
    <section>
      <MarketBriefCard title={title} items={items} ctaLabel={ctaLabel} />
    </section>
  );
}
