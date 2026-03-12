import React from "react";
import { Button } from "../atoms/Button";
import { Tag } from "../atoms/Tag";

type ListItemProps = {
  title: string;
  date: string;
  tag?: string;
  actionLabel?: string;
};

export function ListItem({
  title,
  date,
  tag,
  actionLabel = "Read More",
}: ListItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{date}</span>
          {tag ? <Tag tone="slate">{tag}</Tag> : null}
        </div>
      </div>
      <Button
        variant="primary"
        size="sm"
        className="h-8 rounded-full px-3 text-[11px]"
      >
        {actionLabel}
      </Button>
    </div>
  );
}


