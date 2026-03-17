import React from "react";
import { MarketBriefHeader } from "../molecules/MarketBriefHeader";
import { MarketBriefList } from "../molecules/MarketBriefList";

import type { Messages } from "@/locales";

export function MarketBrief({
  locale,
  messages,
}: {
  locale?: string;
  messages: Messages;
}) {
  return (
    <section className="bg-white rounded shadow p-4">
      <MarketBriefHeader
        title={messages.widgets?.marketBrief?.title || "Today Market Brief"}
        ctaLabel={messages.widgets?.marketBrief?.cta || "Read More Brief"}
        ctaHref="#"
      />
      <MarketBriefList
        items={
          messages.widgets?.marketBrief?.items || [
            "Gold rises as USD weakens",
            "Oil steady ahead of OPEC",
            "IHSG slightly stronger",
          ]
        }
      />
    </section>
  );
}
