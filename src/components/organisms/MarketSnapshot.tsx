import React from "react";
import { SnapshotTabs } from "../molecules/SnapshotTabs";
import { SnapshotRow } from "../molecules/SnapshotRow";
import type { Messages } from "@/locales";

export function MarketSnapshot({ locale, messages }: { locale?: string; messages: Messages }) {
  return (
    <section className="rounded-lg bg-white shadow overflow-hidden">
      <div className="space-y-3 p-4">
        <h3 className="font-semibold text-blue-800">{messages.widgets?.marketSnapshot?.title || "Market Snapshot"}</h3>
        <SnapshotTabs items={messages.widgets?.marketSnapshot?.tabs || ["Today", "Week", "Month", "Year"]} />
        <div>
          {["IDX Composite", "Gold", "USD/IDR", "BCO/USD"].map(
            (label, index) => (
              <SnapshotRow
                key={`${label}-${index}`}
                label={label}
                value="0.45%"
                ctaHref="#"
              />
            ),
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 bg-zinc-200 px-2 py-2">
        {(messages.widgets?.marketSnapshot?.footerLabels || ["Markets", "Commodities", "Equities", "Forex", "Crypto"]).map(
          (label) => (
            <button
              key={label}
              type="button"
              className="text-blue-800 font-semibold cursor-pointer text-xs sm:text-sm px-2 py-1 rounded hover:bg-white/70 transition"
            >
              {label}
            </button>
          ),
        )}
      </div>
    </section>
  );
}
