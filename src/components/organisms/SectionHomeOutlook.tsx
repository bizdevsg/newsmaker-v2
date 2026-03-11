import React from "react";
import Link from "next/link";
import { SectionHeader } from "../molecules/SectionHeader";

type SectionHomeOutlookProps = {
  locale?: string;
};

const outlookItems = [
  {
    key: "overview-uptick",
    title: "Uptick di Metromonia, Pasar Aset Naik?",
    summary: "Aset blue-chip bergerak stabil jelang data inflasi.",
    image: "/assets/tourism-guangzhou-rivers-city-river.jpg",
    href: "#",
  },
  {
    key: "overview-oil-opec",
    title: "Oil Rises After OPEC Signal",
    summary: "Pasar energi respons ketegangan suplai.",
    image:
      "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp",
    href: "#",
  },
];

export function SectionHomeOutlook({ locale = "id" }: SectionHomeOutlookProps) {
  return (
    <section className="rounded-lg bg-white shadow overflow-hidden">
      <SectionHeader
        title="Market Overview"
        link={`/${locale}/news`}
        linkLabel="Read More..."
      />
      <div className="grid items-stretch gap-4 p-4 sm:grid-cols-2">
        {outlookItems.map((item) => (
          <article
            key={item.key}
            className="flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white"
          >
            <div className="aspect-[16/9] flex-shrink-0 overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3">
              <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
                {item.title}
              </h4>
              <p className="line-clamp-3 flex-1 text-xs text-slate-500">{item.summary}</p>
              <Link
                href={item.href}
                className="mt-auto pt-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                Read More &gt;
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
