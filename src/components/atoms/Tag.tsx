import React from "react";

type TagTone = "blue" | "slate" | "emerald";

type TagProps = {
  children: React.ReactNode;
  tone?: TagTone;
  className?: string;
};

const tones: Record<TagTone, string> = {
  blue: "bg-blue-100 text-blue-700",
  slate: "bg-slate-100 text-slate-800",
  emerald: "bg-slate-200 text-blue-600",
};

export function Tag({ children, tone = "slate", className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
        tones[tone]
      } ${className}`}
    >
      {children}
    </span>
  );
}
