import React from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import type { TikTokItem } from "./fetchLatestTikTok";

type MarketPulseCardProps = {
  tiktokItem: TikTokItem | null;
  className?: string;
};

export function MarketPulseCard({
  tiktokItem,
  className = "",
}: MarketPulseCardProps) {
  return (
    <Card className={`flex h-fit flex-col ${className}`.trim()}>
      <SectionHeader title="Market Pulse" />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="overflow-hidden rounded-xl bg-black">
          <div className="flex h-[clamp(320px,60vh,600px)] w-full">
            {tiktokItem ? (
              <video
                key={tiktokItem.id}
                src={tiktokItem.video_url}
                title={tiktokItem.title ?? "Market Pulse"}
                className="h-full w-full object-contain"
                controls
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white text-sm font-semibold text-slate-400">
                TikTok video unavailable
              </div>
            )}
          </div>
        </div>

        {tiktokItem?.title ? (
          <p className="line-clamp-2 text-sm font-semibold text-slate-900">
            {tiktokItem.title}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
