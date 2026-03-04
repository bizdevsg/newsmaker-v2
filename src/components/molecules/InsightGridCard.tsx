import React from "react";
import { Card } from "../atoms/Card";

type InsightGridCardProps = {
  title: string;
  items: string[];
  ctaLabel: string;
  readMoreLabel: string;
  imageSrc: string;
};

export function InsightGridCard({
  title,
  items,
  ctaLabel,
  readMoreLabel,
  imageSrc,
}: InsightGridCardProps) {
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-md border border-slate-200 bg-slate-50"
          >
            <img src={imageSrc} alt={item} className="h-36 w-full object-cover" />
            <div className="p-4">
              <p className="text-sm font-semibold text-slate-800">{item}</p>
              <p className="mt-2 text-xs text-slate-500">{readMoreLabel}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <a
          href="#"
          className="rounded-md bg-blue-700 px-4 py-2 text-xs font-semibold text-white"
        >
          {ctaLabel}
        </a>
      </div>
    </Card>
  );
}
