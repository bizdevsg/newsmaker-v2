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
    <div className="relative z-10 p-4 border-b border-white/30">
      <h2 className="uppercase text-white">
        <strong>{emphasis}</strong> {label}
      </h2>
    </div>
  );
}
