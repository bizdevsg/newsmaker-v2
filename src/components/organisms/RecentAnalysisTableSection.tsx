import React from "react";
import { SectionHeader } from "../molecules/SectionHeader";
import { RecentAnalysisTableHeader } from "../molecules/RecentAnalysisTableHeader";
import { RecentAnalysisTableRow } from "../molecules/RecentAnalysisTableRow";

const rows = [
  {
    title: "Gold Outlook Holds",
    subtitle: "Strategic momentum",
    change: "+5.18%",
    value: "$50,000",
    volume: "133.20M",
    score: "+3.05%",
    dotClassName: "bg-emerald-500",
  },
  {
    title: "Commodities Under Pressure",
    subtitle: "China data watch",
    change: "+3.10%",
    value: "$42,850",
    volume: "95.10M",
    score: "+2.10%",
    dotClassName: "bg-blue-500",
  },
  {
    title: "Oil Price Moves Higher",
    subtitle: "Supply & demand",
    change: "+1.40%",
    value: "$81.10",
    volume: "70.80M",
    score: "+0.90%",
    dotClassName: "bg-slate-400",
  },
];

export function RecentAnalysisTableSection() {
  return (
    <section className="bg-white rounded-lg shadow">
      <SectionHeader title="Recent Analysis" link="#" linkLabel="Recent >" />
      <RecentAnalysisTableHeader />
      <div className="divide-y divide-slate-100">
        {rows.map((row, index) => (
          <RecentAnalysisTableRow
            key={`${row.title}-${index}`}
            title={row.title}
            subtitle={row.subtitle}
            change={row.change}
            value={row.value}
            volume={row.volume}
            score={row.score}
            dotClassName={row.dotClassName}
          />
        ))}
      </div>
    </section>
  );
}
