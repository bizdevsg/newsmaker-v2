import React from "react";
import { SiteHeader } from "../organisms/SiteHeader";
import { SiteFooter } from "../organisms/SiteFooter";
import { StickyNav } from "../organisms/StickyNav";
import { TickerBar } from "../organisms/TickerBar";
import { ScrollUpButton } from "../organisms/ScrollUpButton";
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
    <div className="relative min-h-screen text-slate-800">
      <div className="relative z-10 nm-bg-cover bg-cover bg-center bg-no-repeat bg-fixed">
        {/* <WorldTimeBar className="hidden md:block" /> */}
        <StickyNav>
          <nav>
            <div className="mx-auto w-full">
              <SiteHeader />
            </div>
          </nav>
        </StickyNav>
        <div className="">
          <div className="mx-auto w-full">
            <TickerBar
              ticks={messages.ticker.ticks}
              topNews={messages.widgets?.tickerBar?.topNews}
            />
          </div>
        </div>
        <main className="px-4 py-4">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
            {children}
          </div>
        </main>
        {/* <FloatingPartnerButtons /> */}
        <ScrollUpButton />
        <div className="mt-5">
          <SiteFooter locale={locale} messages={messages} />
        </div>
      </div>
    </div>
  );
}
