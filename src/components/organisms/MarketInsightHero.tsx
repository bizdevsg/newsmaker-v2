import React from "react";
import { MarketInsightHeader } from "../molecules/MarketInsightHeader";
import { MarketInsightBody } from "../molecules/MarketInsightBody";

export function MarketInsightHero() {
  return (
    <section
      className="relative overflow-hidden rounded-lg bg-white shadow bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-700/70 to-blue-200/50" />
      <MarketInsightHeader label="Insight" emphasis="Market" />
      <MarketInsightBody
        title="Emas menguat, Investor Kembali Hindari Resiko?"
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat deserunt, neque ratione sunt dolores optio officia amet molestiae vitae tenetur praesentium, perspiciatis inventore voluptate ipsa assumenda a! Rem, assumenda minima!"
        ctaLabel="Read Full Insight"
        ctaHref="#"
      />
    </section>
  );
}
