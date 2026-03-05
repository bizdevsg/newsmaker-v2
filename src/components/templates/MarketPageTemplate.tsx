import React from "react";
import { SiteHeader } from "../organisms/SiteHeader";
import { SiteFooter } from "../organisms/SiteFooter";
import { StickyNav } from "../organisms/StickyNav";
import { TickerBar } from "../organisms/TickerBar";
import type { Locale, Messages } from "@/locales";

type MarketPageTemplateProps = {
  children: React.ReactNode;
  locale: Locale;
  messages: Messages;
};

export function MarketPageTemplate({
  children,
  locale,
  messages,
}: MarketPageTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-white text-slate-800">
      <StickyNav>
        <nav>
          <div className="mx-auto w-full">
            <SiteHeader />
          </div>
        </nav>
      </StickyNav>
      <div className="px-4 pt-4">
        <div className="mx-auto w-full max-w-7xl">
          <TickerBar ticks={messages.ticker.ticks} />
        </div>
      </div>
      <main className="px-4 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          {children}
        </div>
      </main>
      <SiteFooter locale={locale} messages={messages} />
    </div>
  );
}
