import React from "react";
import { SiteHeader } from "../organisms/SiteHeader";
import { SiteFooter } from "../organisms/SiteFooter";
import { StickyNav } from "../organisms/StickyNav";
import { TickerBar } from "../organisms/TickerBar";
import { ScrollUpButton } from "../organisms/ScrollUpButton";
import { PopupBannerModal } from "../organisms/PopupBannerModal";
import type { Locale, Messages } from "@/locales";
import { Container } from "../layout/Container";
import { DisclaimerCard } from "../organisms/DisclaimerCard";
import { NmAi } from "../organisms/NmAi";
import { Tagline } from "../organisms/Tagline";

type MarketPageTemplateProps = {
  children: React.ReactNode;
  locale: Locale;
  messages: Messages;
  showPopupBanner?: boolean;
};

export function MarketPageTemplate({
  children,
  locale,
  messages,
  showPopupBanner = false,
}: MarketPageTemplateProps) {
  return (
    <div className="relative min-h-screen overflow-x-clip text-slate-800">
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
              locale={locale}
              topNews={messages.widgets?.tickerBar?.topNews}
            />
          </div>
        </div>
        <div className=" px-4">{children}</div>
        {/* <FloatingPartnerButtons /> */}
        <ScrollUpButton />
        {showPopupBanner ? <PopupBannerModal /> : null}
        <div className="mt-5">
          <SiteFooter locale={locale} messages={messages} />
        </div>
      </div>
    </div>
  );
}
