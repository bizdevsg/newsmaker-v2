import React from "react";
import { Card } from "../atoms/Card";
import { InsightCard } from "../molecules/InsightCard";
import { SectionHeader } from "../molecules/SectionHeader";

const insightItems = [
  {
    title: "Harga Minyak di Atas $80: Bertahan atau Koreksi?",
    summary:
      "Energi terus naik di tengah ketegangan geopolitik. Area teknikal kunci akan menentukan arah berikutnya.",
    image:
      "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp",
  },
  {
    title: "IHSG Menguat, Sektor Mana Paling Diuntungkan?",
    summary:
      "Arus dana asing mulai kembali. Bank besar dan komoditas menjadi perhatian pelaku pasar.",
    image: "/assets/tourism-guangzhou-rivers-city-river.jpg",
  },
];

export function MarketInsightSection() {
  return (
    <section className="rounded-lg bg-white shadow overflow-hidden h-fit">
      <SectionHeader title="Market Insight" />
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {insightItems.map((item) => (
          <InsightCard
            key={item.title}
            title={item.title}
            summary={item.summary}
            imageSrc={item.image}
            ctaLabel="Read More"
          />
        ))}
      </div>
    </section>
  );
}
