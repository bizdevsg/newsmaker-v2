import React from "react";

type TabsProps = {
  items: string[];
  active: string;
};

export function Tabs({ items, active }: TabsProps) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-800">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className={`cursor-pointer border-r border-slate-200 px-4 py-1.5 transition-colors last:border-r-0 ${
            item === active
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-800 hover:bg-white hover:text-slate-800"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}


