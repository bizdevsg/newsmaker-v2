import React from "react";

type ImpactCardProps = {
  title: string;
  summary: string;
  date: string;
  imageLabel: string;
  ctaLabel: string;
};

export function ImpactCard({
  title,
  summary,
  date,
  imageLabel,
  ctaLabel,
}: ImpactCardProps) {
  const isImage = imageLabel.startsWith("/") || imageLabel.startsWith("http");

  return (
    <div className="flex gap-4 rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="w-1/2 overflow-hidden rounded-lg bg-slate-100">
        <img
          src={imageLabel}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex w-1/2 flex-col justify-between py-5 pr-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="line-clamp-4 text-xs text-slate-500">{summary}</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">{date}</p>
          <a
            href="#"
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
