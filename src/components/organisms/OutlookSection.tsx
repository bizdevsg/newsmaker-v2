import React from "react";
import { OutlookGrid } from "../molecules/OutlookGrid";
import { VideoCard } from "../molecules/VideoCard";

type OutlookSectionProps = {
  outlookTitle: string;
  outlookItems: string[];
  readMoreLabel: string;
  calendarTitle: string;
};

export function OutlookSection({
  outlookTitle,
  outlookItems,
  readMoreLabel,
  calendarTitle,
}: OutlookSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <OutlookGrid
        title={outlookTitle}
        items={outlookItems}
        readMoreLabel={readMoreLabel}
        imageSrc="/assets/tourism-guangzhou-rivers-city-river.jpg"
      />
      <VideoCard title={calendarTitle} />
    </section>
  );
}
