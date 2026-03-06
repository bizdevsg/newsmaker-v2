import React from "react";

type RecentAnalysisDotProps = {
  className?: string;
};

export function RecentAnalysisDot({ className = "" }: RecentAnalysisDotProps) {
  return (
    <span
      className={`mt-1 h-2.5 w-2.5 rounded-full ${className}`.trim()}
    />
  );
}
