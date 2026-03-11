import React from "react";

type InsightCardProps = {
  title: string;
  summary: string;
  imageSrc: string;
  ctaLabel: string;
  ctaHref?: string;
};

export function InsightCard({
  title,
  summary,
  imageSrc,
  ctaLabel,
  ctaHref = "#",
}: InsightCardProps) {
  return (
    <article className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="aspect-[16/9] bg-slate-100">
        <img src={imageSrc} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{summary}</p>
        <a
          href={ctaHref}
          className="mt-3 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          {ctaLabel}
        </a>
      </div>
    </article>
  );
}
