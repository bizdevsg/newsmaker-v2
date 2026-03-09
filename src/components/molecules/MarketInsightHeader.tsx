import React from "react";

type MarketInsightHeaderProps = {
  label: string;
  emphasis: string;
};

export function MarketInsightHeader({
  label,
  emphasis,
}: MarketInsightHeaderProps) {
  return (
    <div className="relative z-10 p-4">
      <div className="bg-blue-500/50 w-fit px-2 py-0.5 rounded-full">
        <h2 className="uppercase text-white text-xs select-none">
          <strong>{emphasis}</strong> {label}
        </h2>
      </div>
    </div>
  );
}
