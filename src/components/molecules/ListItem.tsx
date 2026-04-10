import React from "react";
import Link from "next/link";
import { Tag } from "../atoms/Tag";

type ListItemProps = {
  title: string;
  date: string;
  tag?: string;
  actionLabel?: string;
  href?: string;
};

export function ListItem({
  title,
  date,
  tag,
  actionLabel = "Read More",
  href,
}: ListItemProps) {
  const className =
    "flex items-center justify-between gap-4 rounded bg-slate-50 hover:bg-slate-100 border-b border-slate-100 py-3 px-2 last:border-b-0";

  const content = (
    <>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-700">
          {title}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{date}</span>
          {tag ? <Tag tone="blue">{tag}</Tag> : null}
        </div>
      </div>
      {/* <Button
        href={href}
        variant="primary"
        size="sm"
        className="h-8 rounded-full px-3 text-[11px]"
      >
        {actionLabel}
      </Button> */}
    </>
  );

  return (
    href ? (
      <Link href={href} className={`${className} group`}>
        {content}
      </Link>
    ) : (
      <div className={className}>{content}</div>
    )
  );
}
