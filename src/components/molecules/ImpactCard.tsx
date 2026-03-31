import React from "react";

type ImpactCardProps = {
  title: string;
  summary: string;
  date: string;
  imageLabel: string;
  ctaLabel: string;
  href?: string;
};

export function ImpactCard({
  title,
  summary,
  date,
  imageLabel,
  ctaLabel,
  href = "#",
}: ImpactCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white shadow-sm sm:flex-row">
      <div className="w-full overflow-hidden rounded-lg bg-slate-100 sm:w-1/2">
        <div className="aspect-[4/3] sm:aspect-auto sm:h-full">
        <img
          src={imageLabel}
          alt={title}
          className="h-full w-full object-cover"
        />
        </div>
      </div>

      <div className="flex w-full flex-col justify-between px-4 pb-4 sm:w-1/2 sm:px-0 sm:py-5 sm:pr-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="line-clamp-4 text-xs text-slate-500">{summary}</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">{date}</p>
          {href ? (
            <a
              href={href}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
