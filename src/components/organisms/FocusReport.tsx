"use client";

import React from "react";
import { Card } from "../atoms/Card";
import { LiveQuotesBoard } from "./LiveQuotesBoard";
import { SectionHeader } from "../molecules/SectionHeader";
import type { Locale, Messages } from "@/locales";

type FocusReportProps = {
  locale: Locale;
  messages: Messages;
};

export function FocusReport({ locale, messages }: FocusReportProps) {
  return (
    <Card as="section">
      <SectionHeader
        title={messages.focusReport.kicker}
        link={`/${locale}/live-quotes`}
        linkLabel={messages.focusReport.ctaLabel}
      />
      <div className="px-4 py-5">
        <LiveQuotesBoard
          locale={locale}
          messages={messages}
          title={messages.focusReport.title}
          subtitle={messages.focusReport.subtitle}
          limit={7}
        />
      </div>
    </Card>
  );
}
