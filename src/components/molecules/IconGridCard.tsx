import React from "react";
import { Card } from "../atoms/Card";
import { IconBubble } from "../atoms/IconBubble";

type IconGridCardProps = {
  title: string;
  items: string[];
  iconClass: string;
  columns?: 2 | 3;
};

export function IconGridCard({
  title,
  items,
  iconClass,
  columns = 2,
}: IconGridCardProps) {
  const columnClass = columns === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className={`mt-4 grid ${columnClass} gap-3 text-xs`}>
        {items.map((label) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-4 text-center"
          >
            <IconBubble iconClass={iconClass} />
            <span className="text-[11px] font-semibold text-slate-600">
              {label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
