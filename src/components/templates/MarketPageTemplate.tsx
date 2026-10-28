import React from "react";
import { SiteHeader } from "../organisms/SiteHeader";
import { SiteFooter } from "../organisms/SiteFooter";
import { StickyNav } from "../organisms/StickyNav";
import { TickerBar } from "../organisms/TickerBar";
import { ScrollUpButton } from "../organisms/ScrollUpButton";
import { PopupBannerModal } from "../organisms/PopupBannerModal";
import type { Locale, Messages } from "@/locales";

type MarketPageTemplateProps = {
  children: React.ReactNode;
  locale: Locale;
  messages: Messages;
  showPopupBanner?: boolean;
  /** Lock the page to the viewport and let `children` fill the space below
   * the header, for embedded apps that scroll on their own. Hides the footer. */
  fullHeight?: boolean;
};

export function MarketPageTemplate({
  children,
  locale,
  messages,
  showPopupBanner = false,
  fullHeight = false,
}: MarketPageTemplateProps) {
  return (
    <div
      className={`relative overflow-x-clip text-slate-800 ${
        fullHeight ? "h-dvh overflow-hidden" : "min-h-screen"
      }`}
    >
      <div
        className={`relative z-10 nm-bg-cover bg-cover bg-center bg-no-repeat bg-fixed ${
          fullHeight ? "flex h-full flex-col" : ""
        }`}
      >
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
        {fullHeight ? (
          <div className="min-h-0 flex-1">{children}</div>
        ) : (
          children
        )}
        {/* <FloatingPartnerButtons /> */}
        {fullHeight ? null : <ScrollUpButton />}
        {showPopupBanner ? <PopupBannerModal /> : null}
        {fullHeight ? null : (
          <div className="mt-5">
            <SiteFooter locale={locale} messages={messages} />
          </div>
        )}
      </div>
    </div>
  );
}
