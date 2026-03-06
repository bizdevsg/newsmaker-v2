import React from "react";
import { IconCircle } from "../atoms/IconCircle";

type MarketBriefHeaderProps = {
  title: string;
  ctaLabel: string;
  ctaHref?: string;
  iconClass?: string;
};

export function MarketBriefHeader({
  title,
  ctaLabel,
  ctaHref = "#",
  iconClass = "fa-regular fa-clock",
}: MarketBriefHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <IconCircle iconClass={iconClass} />
        <div>
          <h2 className="font-semibold text-blue-800">{title}</h2>
          <hr className="border border-blue-800" />
        </div>
      </div>

      <a
        href={ctaHref}
        className="text-sm text-blue-500 hover:text-blue-700 hover:underline transition"
      >
        {ctaLabel} <i className="fa-solid fa-chevron-right"></i>
      </a>
    </div>
  );
}
