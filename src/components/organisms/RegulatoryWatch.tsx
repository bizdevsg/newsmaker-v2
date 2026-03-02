import React from "react";
import { ListItem } from "../molecules/ListItem";

const items = [
  {
    title: "OJK Tightens Margin Rules for Derivatives",
    date: "Apr 21, 2024",
    tag: "Regulation",
  },
  {
    title: "BI Maintains Rate at 6.00%",
    date: "Apr 24, 2024",
    tag: "Monetary",
  },
  {
    title: "Bappebti Revises Broker Compliance Framework",
    date: "Apr 23, 2024",
    tag: "Governance",
  },
];

export function RegulatoryWatch() {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Regulatory & Institutional Watch
        </h3>
        <a
          href="#"
          className="text-xs font-semibold text-blue-700 transition-colors hover:text-slate-800"
        >
          Read More
        </a>
      </div>
      <div className="px-6 pb-6 pt-4">
        {items.map((item) => (
          <ListItem key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}


