import React from "react";
import { Card } from "../atoms/Card";
import { IconBubble } from "../atoms/IconBubble";

type MarketBriefCardProps = {
  title: string;
  items: string[];
  ctaLabel: string;
  ctaHref?: string;
};

export function MarketBriefCard({
  title,
  items,
  ctaLabel,
  ctaHref = "#",
}: MarketBriefCardProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4 w-full">
          <div className="w-full">
            <div className="flex flex-col  items-start justify-between ">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-4">
                  <IconBubble
                    iconClass="fa-regular fa-clock"
                    variant="outline"
                    size="md"
                  />

                  <p className="text-sm md:text-base font-semibold text-blue-800 border-b border-blue-800 w-fit">
                    {title}
                  </p>
                </div>

                <a
                  href={ctaHref}
                  className="text-xs font-semibold text-blue-700 transition-colors hover:text-blue-800"
                >
                  {ctaLabel} <span aria-hidden="true">&gt;</span>
                </a>
              </div>

              <div className="mt-2 flex">
                <div className="w-10 h-10"></div>
                <ul className="list-disc space-y-1 pl-7 text-xs text-slate-500 list-inside">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
