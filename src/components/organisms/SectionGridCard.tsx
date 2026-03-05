import React from "react";
import { SectionHeader } from "../molecules/SectionHeader";
import { SectionTile } from "../atoms/SectionTile";

type SectionGridCardProps = {
  title: string;
  items: number | string[];
};

export function SectionGridCard({ title, items }: SectionGridCardProps) {
  const normalizedItems =
    typeof items === "number"
      ? Array.from({ length: items }, (_, i) => `Item ${i + 1}`)
      : items;

  return (
    <section className="rounded-lg bg-white shadow overflow-hidden">
      <SectionHeader title={title} />
      <hr className="border-slate-100" />
      <div className="grid grid-cols-3 gap-2 p-4">
        {normalizedItems.map((item, index) => (
          <SectionTile key={`${item}-${index}`} label={item} />
        ))}
      </div>
    </section>
  );
}
