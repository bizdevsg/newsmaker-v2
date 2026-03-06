import React from "react";

type SectionHeaderProps = {
  title: string;
  optional?: string;
  link?: string;
  linkLabel?: string;
};

export function SectionHeader({
  title,
  optional,
  link,
  linkLabel,
}: SectionHeaderProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-4">
        <div className="flex w-full items-center justify-between">
          <h3 className="font-bold text-lg capitalize tracking-wide text-blue-800">
            {title}
          </h3>
          <span className="text-xs text-slate-400">{optional}</span>
          <a
            href={link}
            className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition"
          >
            {linkLabel}
          </a>
        </div>
      </div>

      <hr className="border-slate-100" />
    </div>
  );
}
