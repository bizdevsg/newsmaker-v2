"use client";

import React from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { TikTokEmbed } from "@/components/molecules/TikTokEmbed";
import { IconButton } from "./IconButton";
import type { TikTokItem } from "./fetchLatestTikTok";

type MarketPulseCardProps = {
  tiktokItems: TikTokItem[];
  className?: string;
};

export function MarketPulseCard({
  tiktokItems,
  className = "",
}: MarketPulseCardProps) {
  const slides = React.useMemo(() => tiktokItems.slice(0, 3), [tiktokItems]);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  const total = slides.length;
  const clampIndex = React.useCallback(
    (value: number) => {
      if (!total) return 0;
      return ((value % total) + total) % total;
    },
    [total],
  );

  const goPrev = React.useCallback(() => {
    setActiveIndex((current) => clampIndex(current - 1));
  }, [clampIndex]);

  const goNext = React.useCallback(() => {
    setActiveIndex((current) => clampIndex(current + 1));
  }, [clampIndex]);

  const activeItem = total ? slides[clampIndex(activeIndex)] : null;
  const backupUrl = activeItem?.backup_video_url ?? null;
  const hasBackup = Boolean(backupUrl);

  return (
    <Card className={`flex h-fit flex-col ${className}`.trim()}>
      <SectionHeader title="Market Pulse" />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="overflow-hidden rounded-xl bg-white">
          <div className="flex h-[clamp(320px,60vh,600px)] w-full">
            {total ? (
              <div className="h-full w-full overflow-hidden">
                <div
                  className="flex h-full w-full transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateX(-${clampIndex(activeIndex) * 100}%)`,
                  }}
                >
                  {slides.map((item, index) => {
                    const slideBackupUrl = item?.backup_video_url ?? null;
                    const slideHasBackup = Boolean(slideBackupUrl);

                    return (
                      <div
                        key={String(item?.id ?? `slide-${index}`)}
                        className="flex h-full w-full shrink-0"
                        aria-hidden={clampIndex(activeIndex) !== index}
                      >
                        {slideHasBackup ? (
                          <TikTokEmbed
                            html=""
                            backupVideoUrl={slideBackupUrl}
                            forceBackupUrl
                            className="flex-1 [&_.tiktok-embed]:!m-0 [&_.tiktok-embed]:!max-w-full [&_.tiktok-embed]:!min-w-0 [&_.tiktok-embed]:!border-0 [&_.tiktok-embed]:!shadow-none [&_.tiktok-embed]:!rounded-none"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                            TikTok video unavailable
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                TikTok video unavailable
              </div>
            )}
          </div>
        </div>

        {total > 1 ? (
          <div className="flex items-center justify-between gap-3">
            <IconButton
              label="Previous"
              iconClassName="fa-solid fa-arrow-left text-xs"
              onClick={goPrev}
              disabled={total < 2}
            />

            <div className="flex items-center justify-center gap-1.5">
              {slides.map((item, index) => {
                const isActive = clampIndex(activeIndex) === index;
                return (
                  <button
                    key={String(item?.id ?? `dot-${index}`)}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={[
                      "h-1.5 w-1.5 rounded-full transition",
                      isActive
                        ? "bg-blue-700"
                        : "bg-slate-300 hover:bg-slate-400",
                    ].join(" ")}
                    aria-label={`Go to video ${index + 1}`}
                    aria-current={isActive ? "true" : undefined}
                  />
                );
              })}
            </div>

            <IconButton
              label="Next"
              iconClassName="fa-solid fa-arrow-right text-xs"
              onClick={goNext}
              disabled={total < 2}
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
