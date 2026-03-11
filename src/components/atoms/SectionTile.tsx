import React from "react";

type SectionTileProps = {
  label: string;
};

export function SectionTile({ label }: SectionTileProps) {
  return (
    <div className="rounded-lg bg-slate-100 p-4 text-center font-semibold text-blue-900">
      <div className="flex flex-col items-center gap-3">
        <div className="h-19 w-19 bg-zinc-500 rounded-full"></div>
        <h6>{label}</h6>
      </div>
    </div>
  );
}
