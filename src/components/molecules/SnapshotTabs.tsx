import React from "react";

type SnapshotTabsProps = {
  items: string[];
};

export function SnapshotTabs({ items }: SnapshotTabsProps) {
  return (
    <div className="w-full grid grid-cols-4 rounded overflow-hidden">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className="w-full text-sm bg-zinc-100 font-semibold hover:bg-blue-600 hover:text-white transition py-1 cursor-pointer"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
