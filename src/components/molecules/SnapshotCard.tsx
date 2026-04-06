import React from "react";
import Link from "next/link";
import { IconBadge } from "../atoms/IconBadge";
import type { Locale } from "@/locales";

type SnapshotCardProps = {
  itemKey?: string;
  locale?: Locale;
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  meta: string;
  href?: string;
  external?: boolean;
};

const resolveSnapshotHref = (
  itemKey: string | undefined,
  locale: Locale,
): { href?: string; external: boolean } => {
  switch (itemKey) {
    case "bi-rate":
      return { href: `/${locale}/bi-rate`, external: false };
    case "ojk-update":
      return { href: `/${locale}/regulasi-ojk`, external: false };
    case "bappebti-circular":
      return { href: `/${locale}/regulasi-bappebti`, external: false };
    case "bbj-activity":
      return { href: "https://www.bbj-jfx.com/", external: true };
    default:
      return { href: undefined, external: false };
  }
};

export function SnapshotCard({
  itemKey,
  locale = "id",
  icon,
  title,
  value,
  subtitle,
  meta,
  href,
  external = false,
}: SnapshotCardProps) {
  const fallbackNavigation = resolveSnapshotHref(itemKey, locale);
  const resolvedHref = href ?? fallbackNavigation.href;
  const isExternal = href ? external : fallbackNavigation.external;

  const cardContent = (
    <div className="flex h-full gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="shrink-0">
        <IconBadge label={icon} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
        <p className="text-lg font-bold text-slate-800 leading-tight wrap-break-words hyphens-auto">
          {value}
        </p>
        <p className="text-xs text-slate-500 wrap-break-words leading-snug line-clamp-1">
          {subtitle}
        </p>
        <p className="text-[11px] text-slate-400 mt-auto pt-1">{meta}</p>
      </div>
    </div>
  );

  if (!resolvedHref) {
    return cardContent;
  }

  if (isExternal) {
    return (
      <a
        href={resolvedHref}
        target="_blank"
        rel="noreferrer"
        className="block h-full"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={resolvedHref} className="block h-full">
      {cardContent}
    </Link>
  );
}
