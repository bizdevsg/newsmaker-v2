import React from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import type { Locale } from "@/locales";

type MaintenanceCardProps = {
  locale: Locale;
  /** Shown as the card header; omit for cards that have no title. */
  title?: string;
  className?: string;
};

/** Placeholder card shown in place of a feature that is temporarily offline. */
export function MaintenanceCard({
  locale,
  title,
  className = "",
}: MaintenanceCardProps) {
  const heading =
    locale === "en" ? "Under Maintenance" : "Sedang Dalam Perbaikan";

  return (
    <Card className={`flex h-fit flex-col ${className}`.trim()}>
      {title ? <SectionHeader title={title} /> : null}

      <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500 ring-8 ring-amber-50">
          <i
            className="fa-solid fa-screwdriver-wrench text-2xl"
            aria-hidden="true"
          ></i>
        </div>
        <h4 className="mt-2 text-base font-bold tracking-[-0.02em] text-slate-900">
          {heading}
        </h4>
        <p className="text-sm leading-relaxed text-slate-500">
          {locale === "en"
            ? "This feature is being improved and will be back soon."
            : "Fitur ini sedang dalam peningkatan dan akan segera kembali."}
        </p>
      </div>
    </Card>
  );
}
