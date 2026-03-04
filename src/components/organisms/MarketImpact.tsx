import React from "react";
import { ImpactCard } from "../molecules/ImpactCard";
import type { Messages } from "@/locales";

type MarketImpactProps = {
  messages: Messages;
};

export function MarketImpact({ messages }: MarketImpactProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {messages.marketImpact.title}
        </h3>
        <a href="#" className="text-xs font-semibold text-blue-700">
          {messages.marketImpact.ctaLabel}
        </a>
      </div>
      <div className="px-6 pb-6 pt-4 space-y-4">
        {messages.marketImpact.items.map((impact) => (
          <ImpactCard
            key={impact.key}
            title={impact.title}
            summary={impact.summary}
            date={impact.date}
            imageLabel={impact.imageLabel}
            ctaLabel={messages.common.readFullInsight}
          />
        ))}
      </div>
    </section>
  );
}
