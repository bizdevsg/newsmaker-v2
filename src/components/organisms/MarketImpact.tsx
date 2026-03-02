import React from "react";
import { ImpactCard } from "../molecules/ImpactCard";

const impacts = [
  {
    title: "Rupiah Stabil, Implikasi Kebijakan BI?",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae nulla quis est vestibulum fringilla. Mauris elementum tempus lacinia. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed non mauris bibendum, porta massa sit amet, mattis velit. Nullam vel eleifend nibh. Nulla sollicitudin arcu tellus.",
    date: "Apr 24, 2024",
    imageLabel: "./assets/Screenshot-2024-10-29-at-11.27.48.png",
  },
  {
    title: "Volume BBJ Naik Pesat, Apa Faktor Utamanya?",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae nulla quis est vestibulum fringilla. Mauris elementum tempus lacinia. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed non mauris bibendum, porta massa sit amet, mattis velit. Nullam vel eleifend nibh. Nulla sollicitudin arcu tellus.",
    date: "Apr 23, 2024",
    imageLabel: "./assets/Screenshot-2024-10-29-at-11.27.48.png",
  },
];

export function MarketImpact() {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Indonesia Market Impact
        </h3>
        <a href="#" className="text-xs font-semibold text-blue-700">
          Read Full Insight
        </a>
      </div>
      <div className="px-6 pb-6 pt-4 space-y-4">
        {impacts.map((impact) => (
          <ImpactCard key={impact.title} {...impact} />
        ))}
      </div>
    </section>
  );
}
