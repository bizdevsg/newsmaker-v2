import React from "react";
import { Button } from "../atoms/Button";
import { Tag } from "../atoms/Tag";

type InsightHeroCardProps = {
  kicker: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref?: string;
  backgroundImage: string;
};

export function InsightHeroCard({
  kicker,
  title,
  body,
  ctaLabel,
  ctaHref = "#",
  backgroundImage,
}: InsightHeroCardProps) {
  return (
    <div className="relative overflow-hidden rounded-md border border-slate-200 text-white shadow-lg">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-700/75 to-blue-600/60" />
      <div className="relative flex min-h-[260px] flex-col gap-7 p-7 md:flex-row md:items-stretch">
        <div className="flex h-full w-full max-w-xl flex-1 flex-col">
          <div className="space-y-3">
            <Tag tone="slate" className="bg-white/15 text-white">
              {kicker}
            </Tag>
            <h2 className="text-3xl font-semibold">{title}</h2>
            <p className="text-base text-white/80">{body}</p>
          </div>

          <div className="mt-auto">
            <Button
              href={ctaHref}
              variant="primaryAlt"
              size="sm"
              className="border-white/60 text-white w-fit"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
