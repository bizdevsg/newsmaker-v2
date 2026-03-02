import React from "react";
import { Tabs } from "../molecules/Tabs";
import { StatTile } from "../molecules/StatTile";

const stats = [
  { label: "IHSG", value: "7,150", delta: "+0.68%", tone: "up" as const },
  {
    label: "IDR/USD",
    value: "15,680",
    delta: "+0.04%",
    tone: "up" as const,
  },
  {
    label: "Contracts",
    value: "132,000",
    delta: "-0.22%",
    tone: "down" as const,
  },
  {
    label: "Derivation Vol",
    value: "1,254,000",
    delta: "+1.30%",
    tone: "up" as const,
  },
];

export function ExchangeActivity() {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Indonesia Exchange & Derivatives Activity
        </h3>
      </div>
      <div className="px-6 pb-6 pt-4">
        <Tabs
          items={["Markets", "Derivatives", "Rates", "Flows"]}
          active="Markets"
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {stats.map((stat) => (
            <StatTile key={stat.label} {...stat} />
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-100 p-4 text-xs text-slate-500">
          Intraday heatmap placeholder - shifted to data panels in full build.
        </div>
      </div>
    </section>
  );
}


