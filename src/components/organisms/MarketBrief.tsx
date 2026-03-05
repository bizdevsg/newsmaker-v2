import React from "react";
import { MarketBriefHeader } from "../molecules/MarketBriefHeader";
import { MarketBriefList } from "../molecules/MarketBriefList";

export function MarketBrief() {
  return (
    <section className="bg-white rounded p-4">
      <MarketBriefHeader
        title="Today Market Brief"
        ctaLabel="Read More Brief"
        ctaHref="#"
      />
      <MarketBriefList
        items={[
          "Gold naik karena USD melemah",
          "Oil stabil menjelang OPEC",
          "IHSG menguat tipis",
        ]}
      />
    </section>
  );
}
