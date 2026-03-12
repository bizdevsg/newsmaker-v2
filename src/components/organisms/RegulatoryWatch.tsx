import React from "react";
import { Card } from "../atoms/Card";
import { ListItem } from "../molecules/ListItem";
import type { Messages } from "@/locales";

type RegulatoryWatchProps = {
  messages: Messages;
};

export function RegulatoryWatch({ messages }: RegulatoryWatchProps) {
  return (
    <Card as="section">
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {messages.regulatoryWatch.title}
            </h3>
            <span className="mt-2 block h-0.5 w-16 rounded-full bg-blue-600" />
          </div>
          <a
            href="#"
            className="text-xs font-semibold text-blue-700 transition-colors hover:text-blue-800"
          >
            {messages.regulatoryWatch.ctaLabel}
          </a>
        </div>
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
    </Card>
  );
}


