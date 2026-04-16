import React from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { TikTokEmbed } from "@/components/molecules/TikTokEmbed";
import { IconButton } from "./IconButton";
import type { TikTokItem } from "./fetchLatestTikTok";

type MarketPulseCardProps = {
  tiktokItem: TikTokItem | null;
  className?: string;
};

export function MarketPulseCard({
  tiktokItem,
  className = "",
}: MarketPulseCardProps) {
  const backupUrl = tiktokItem?.backup_video_url ?? null;
  const hasBackup = Boolean(backupUrl);

  return (
    <Card className={`flex h-full flex-col ${className}`.trim()}>
      <SectionHeader
        title="Market Pulse"
        actions={
          <div className="flex items-center gap-2">
            <IconButton
              label="Previous"
              iconClassName="fa-solid fa-arrow-left text-xs"
            />
            <IconButton
              label="Next"
              iconClassName="fa-solid fa-arrow-right text-xs"
            />
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="overflow-hidden rounded-xl bg-white">
          <div className="h-[60vh] w-full sm:h-[540px] sm:max-h-none lg:h-[600px]">
            {hasBackup ? (
              <TikTokEmbed
                html=""
                backupVideoUrl={backupUrl}
                forceBackupUrl
                className="h-full w-full [&_.tiktok-embed]:!m-0 [&_.tiktok-embed]:!max-w-full [&_.tiktok-embed]:!min-w-0 [&_.tiktok-embed]:!border-0 [&_.tiktok-embed]:!shadow-none [&_.tiktok-embed]:!rounded-none [&_iframe]:block [&_iframe]:h-full [&_iframe]:w-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                TikTok video unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
