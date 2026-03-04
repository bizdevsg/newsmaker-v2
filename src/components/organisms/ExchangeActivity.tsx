import React from "react";
import { Tabs } from "../molecules/Tabs";
import { StatTile } from "../molecules/StatTile";
import type { Messages } from "@/locales";

type ExchangeActivityProps = {
  messages: Messages;
};

export function ExchangeActivity({ messages }: ExchangeActivityProps) {
  const tabs = messages.exchangeActivity.tabs;
  const activeTab =
    tabs.find((tab) => tab.key === messages.exchangeActivity.activeTabKey)
      ?.label ?? tabs[0]?.label ?? "";

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {messages.exchangeActivity.title}
        </h3>
      </div>
      <div className="px-6 pb-6 pt-4">
        <Tabs items={tabs.map((tab) => tab.label)} active={activeTab} />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {messages.exchangeActivity.stats.map((stat) => (
            <StatTile
              key={stat.key}
              label={stat.label}
              value={stat.value}
              delta={stat.delta}
              tone={stat.tone}
            />
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-100 p-4 text-xs text-slate-500">
          {messages.exchangeActivity.heatmapNote}
        </div>
      </div>
    </section>
  );
}


