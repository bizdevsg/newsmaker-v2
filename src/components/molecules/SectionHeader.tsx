import React from "react";
import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  optional?: React.ReactNode;
  link?: string;
  linkLabel?: string;
  actions?: React.ReactNode;
};

export function SectionHeader({
  title,
  optional,
  link,
  linkLabel,
  actions,
}: SectionHeaderProps) {
  const resolvedLinkLabel = linkLabel?.trim();

  return (
    <div className="space-y-5 px-4 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold leading-none tracking-[-0.04em] text-[#1f3f6b] md:text-xl">
          {title}
        </h3>
        <div className="flex items-center gap-3">
          {optional ? (
            typeof optional === "string" ? (
              <span className="text-xs text-slate-400">{optional}</span>
            ) : (
              optional
            )
          ) : null}
          {link && resolvedLinkLabel ? (
            <Link
              href={link}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition"
            >
              {resolvedLinkLabel}
            </Link>
          ) : null}
          {actions}
        </div>
      </div>

      <div className="relative h-0.75">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
        <div className="absolute left-0 top-1/2 h-0.5 w-20 -translate-y-1/2 bg-blue-700 rounded-full" />
      </div>
    </div>
  );
}
