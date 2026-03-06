import React from "react";

type MarketHighlightItemProps = {
  title: string;
  subtitle: string;
  href?: string;
  className?: string;
};

export function MarketHighlightItem({
  title,
  subtitle,
  href = "#",
  className = "",
}: MarketHighlightItemProps) {
  return (
    <a
      href={href}
      className={`block w-full border-b border-slate-100 py-3 text-sm font-semibold text-slate-700 transition last:border-b-0 hover:text-blue-700 ${className}`.trim()}
    >
      {title}
      <span className="mt-1 block text-xs font-normal text-slate-400">
        {subtitle}
      </span>
    </a>
  );
}
