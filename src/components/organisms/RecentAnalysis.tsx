import React from "react";
import { Card } from "../atoms/Card";
import type { Messages } from "@/locales";
import { SectionHeader } from "../molecules/SectionHeader";

type RecentAnalysisProps = {
  messages: Messages;
};

export function RecentAnalysis({ messages }: RecentAnalysisProps) {
  const items = [
    {
      title: "Gold Steady Updates",
      summary: "Investors look for direction amid global cues.",
      image: "/assets/Screenshot-2024-10-29-at-11.27.48.png",
    },
    {
      title: "Oil Rises After OPEC",
      summary: "Tight supply backdrop lifts prices.",
      image: "/assets/tourism-guangzhou-rivers-city-river.jpg",
    },
    {
      title: "Bitcoin Bounce Back",
      summary: "Crypto regains momentum with risk-on flows.",
      image:
        "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp",
    },
    {
      title: "US Data Softens",
      summary: "Macro releases nudge rate expectations.",
      image: "/assets/Screenshot-2024-10-29-at-11.27.48.png",
    },
  ];

  return (
    <section className="bg-white rounded-lg shadow">
      <SectionHeader title="Recent Analysis" link="#" linkLabel="Recent >" />
      <div className="grid gap-4 px-4 pb-6 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.title}
            className="overflow-hidden rounded-md border border-slate-200 bg-white"
          >
            <div className="aspect-[16/9] overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 p-3">
              <h4 className="text-sm font-semibold text-slate-800">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500">{item.summary}</p>
              <button
                type="button"
                className="text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                Read More &gt;
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
