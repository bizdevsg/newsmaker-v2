import React from "react";
import { ListItem } from "../molecules/ListItem";
import type { Messages } from "@/locales";

type RegulatoryWatchProps = {
  messages: Messages;
};

export function RegulatoryWatch({ messages }: RegulatoryWatchProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {messages.regulatoryWatch.title}
        </h3>
        <a
          href="#"
          className="text-xs font-semibold text-blue-700 transition-colors hover:text-slate-800"
        >
          {messages.regulatoryWatch.ctaLabel}
        </a>
      </div>
      <div className="px-6 pb-6 pt-4">
        {messages.regulatoryWatch.items.map((item) => (
          <ListItem
            key={item.key}
            title={item.title}
            date={item.date}
            tag={item.tag}
            actionLabel={messages.regulatoryWatch.actionLabel}
          />
        ))}
      </div>
    </section>
  );
}


