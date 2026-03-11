import React from "react";

type MarketInsightBodyProps = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
};

export function MarketInsightBody({
  title,
  description,
  ctaLabel,
  ctaHref = "#",
}: MarketInsightBodyProps) {
  return (
    <div className="relative z-10 p-4 flex flex-col justify-between gap-10 max-w-lg">
      <div className="space-y-3">
        <div className="w-fit space-y-3">
          <h2 className="text-2xl text-white font-semibold">{title}</h2>
          <hr className="border-white/40" />
        </div>
        <p className="line-clamp-3 text-white/90">{description}</p>
      </div>

      <div>
        <a
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
        >
          {ctaLabel}
          <i className="fa-solid fa-arrow-right text-xs"></i>
        </a>
      </div>
    </div>
  );
}
