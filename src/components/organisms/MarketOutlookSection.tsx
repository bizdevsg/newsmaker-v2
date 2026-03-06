import React from "react";
import { SectionHeader } from "../molecules/SectionHeader";

const outlookItems = [
  {
    key: "overview-uptick",
    title: "Uptick di Metromonia, Pasar Aset Naik?",
    summary: "Aset blue-chip bergerak stabil jelang data inflasi.",
    image: "/assets/tourism-guangzhou-rivers-city-river.jpg",
  },
  {
    key: "overview-oil-opec",
    title: "Oil Rises After OPEC Signal",
    summary: "Pasar energi respons ketegangan suplai.",
    image:
      "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp",
  },
  {
    key: "overview-bitcoin-1",
    title: "Bitcoin Bounce Back",
    summary: "Sentimen risk-on mengangkat aset kripto.",
    image: "/assets/Screenshot-2024-10-29-at-11.27.48.png",
  },
  {
    key: "overview-bitcoin-2",
    title: "Bitcoin Bounce Back",
    summary: "Sentimen risk-on mengangkat aset kripto.",
    image: "/assets/Screenshot-2024-10-29-at-11.27.48.png",
  },
];

export function MarketOutlookSection() {
  return (
    <section className="rounded-lg bg-white shadow overflow-hidden">
      <SectionHeader
        title="Market Overview"
        link="#"
        linkLabel="Read More..."
      />
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {outlookItems.map((item) => (
          <article
            key={item.key}
            className="rounded-md border border-slate-200 bg-white overflow-hidden"
          >
            <div className="aspect-[16/9] overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 p-3">
              <h4 className="text-sm font-semibold text-slate-800">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500">{item.summary}</p>
              <button
                type="button"
                className="text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                Read More &gt;
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
