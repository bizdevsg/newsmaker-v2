import React from "react";
import Link from "next/link";
import { Card } from "../../atoms/Card";

type PanelArticleCardProps = {
  eyebrow?: string;
  title: string;
  date: string;
  image?: string;
  ctaLabel: string;
  href?: string;
};

export function PanelArticleCard({
  eyebrow,
  title,
  date,
  image,
  ctaLabel,
  href,
}: PanelArticleCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-none">
      {image ? (
        <div className="aspect-16/10 w-full overflow-hidden bg-slate-100">
          <img src={image} alt={title} className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="space-y-2 p-3">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700">
            {eyebrow}
          </p>
        ) : null}
        <p className="line-clamp-1 text-sm font-semibold text-slate-800">
          {title}
        </p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-300">{date}</p>
          {href ? (
            <Link
              href={href}
              className="inline-flex h-7 items-center rounded-md bg-blue-700 px-3 text-[11px] font-semibold text-white transition hover:bg-blue-800"
            >
              {ctaLabel}
            </Link>
          ) : (
            <span className="inline-flex h-7 items-center rounded-md bg-blue-700 px-3 text-[11px] font-semibold text-white">
              {ctaLabel}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
