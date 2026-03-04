import React from "react";
import { Card } from "../atoms/Card";

type VideoCardProps = {
  title: string;
};

export function VideoCard({ title }: VideoCardProps) {
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
        <div className="aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700"></div>
      </div>
    </Card>
  );
}
