import React from "react";

type ChartImageProps = {
  src: string;
  alt: string;
};

export function ChartImage({ src, alt }: ChartImageProps) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <img src={src} alt={alt} className="h-72 w-full object-cover" />
    </div>
  );
}
