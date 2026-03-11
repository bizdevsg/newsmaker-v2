import React from "react";

type MarketBriefListProps = {
  items: string[];
};

export function MarketBriefList({ items }: MarketBriefListProps) {
  return (
    <div className="pl-14 mt-1 text-sm">
      <ul className="list-disc list-inside">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
