import React from "react";

type IconBadgeProps = {
  label: string;
  className?: string;
};

export function IconBadge({ label, className = "" }: IconBadgeProps) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/50 bg-white text-sm font-bold text-blue-700 shadow-sm ${className}`}
    >
      {label}
    </div>
  );
}


