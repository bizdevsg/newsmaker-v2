import React from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { IconButton } from "./IconButton";

export function VideoBriefingCard() {
  return (
    <Card>
      <SectionHeader
        title="Video Briefing"
        actions={
          <div className="flex items-center gap-2">
            <IconButton
              label="Previous"
              iconClassName="fa-solid fa-arrow-left text-sm"
            />
            <IconButton
              label="Next"
              iconClassName="fa-solid fa-arrow-right text-sm"
            />
          </div>
        }
      />
      <div className="p-4">
        <div className="overflow-hidden rounded-xl bg-slate-100">
          <div className="aspect-16/10 w-full">
            <img
              src="/assets/bg-livetv2.jpg"
              alt="Video briefing"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

