import React from "react";
import { SnapshotCard } from "../molecules/SnapshotCard";

const snapshotData = [
  {
    icon: "BI",
    title: "BI Rate",
    value: "6.00%",
    subtitle: "Apr 24, 2024",
    meta: "Unchanged - IDR 15,680",
  },
  {
    icon: "OJK",
    title: "OJK",
    value: "Regulation Update",
    subtitle: "Derivative margin rules tightened",
    meta: "Apr 21, 2024",
  },
  {
    icon: "BB",
    title: "Bappebti Circular",
    value: "Compliance Revision",
    subtitle: "Broker reporting adjustments",
    meta: "Apr 23, 2024",
  },
  {
    icon: "BBJ",
    title: "BBJ Volume Activity",
    value: "+12.4%",
    subtitle: "MoM Volume",
    meta: "Rp 18.7T - Apr 23, 2024",
  },
];

export function PolicySnapshot() {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Indonesia Policy Snapshot
        </h3>
        <a
          href="#"
          className="text-xs font-semibold text-blue-700 transition-colors hover:text-slate-800"
        >
          Read Full Insight {">"}
        </a>
      </div>
      <div className="grid gap-4 px-6 pb-6 pt-5 md:grid-cols-2 xl:grid-cols-4">
        {snapshotData.map((item) => (
          <SnapshotCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}


