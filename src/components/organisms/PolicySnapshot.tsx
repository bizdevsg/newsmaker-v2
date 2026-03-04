import React from "react";
import { SnapshotCard } from "../molecules/SnapshotCard";
import type { Messages } from "@/locales";

type PolicySnapshotProps = {
  messages: Messages;
};

export function PolicySnapshot({ messages }: PolicySnapshotProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {messages.policySnapshot.title}
        </h3>
        <a
          href="#"
          className="text-xs font-semibold text-blue-700 transition-colors hover:text-slate-800"
        >
          {messages.policySnapshot.ctaLabel}
        </a>
      </div>
      <div className="grid gap-4 px-6 pb-6 pt-5 md:grid-cols-2 xl:grid-cols-4">
        {messages.policySnapshot.items.map((item) => (
          <SnapshotCard
            key={item.key}
            icon={item.icon}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            meta={item.meta}
          />
        ))}
      </div>
    </section>
  );
}


