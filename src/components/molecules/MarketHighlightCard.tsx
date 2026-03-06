import React from "react";
import { Button } from "../atoms/Button";

type MarketHighlightCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
  href?: string;
};

export function MarketHighlightCard({
  title,
  description,
  imageSrc,
  imageAlt = "",
  href = "#",
}: MarketHighlightCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
      <img src={imageSrc} alt={imageAlt} className="h-28 w-full object-cover" />
      <div className="p-3">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <div className="px-3 pb-3">
        <Button size="sm" className="w-full">
          Read More
        </Button>
      </div>
    </div>
  );
}
