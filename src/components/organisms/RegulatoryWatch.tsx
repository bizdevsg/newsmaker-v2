import React from "react";
import { Card } from "../atoms/Card";
import { ListItem } from "../molecules/ListItem";
import type { Messages } from "@/locales";
import { SectionHeader } from "../molecules/SectionHeader";

type RegulatoryWatchProps = {
  messages: Messages;
};

export function RegulatoryWatch({ messages }: RegulatoryWatchProps) {
  return (
    <Card as="section">
      <SectionHeader title={messages.regulatoryWatch.title} />
      <div className="px-6 py-5">
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
