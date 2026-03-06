import React from "react";
import { MarketPageTemplate } from "./MarketPageTemplate";
import { CommoditiesMarketOverview } from "../organisms/CommoditiesMarketOverview";
import { CommoditiesRecentAnalysis } from "../organisms/CommoditiesRecentAnalysis";
import type { Locale, Messages } from "@/locales";

type CommoditiesPageTemplateProps = {
    locale: Locale;
    messages: Messages;
};

export function CommoditiesPageTemplate({
    locale,
    messages,
}: CommoditiesPageTemplateProps) {
    return (
        <MarketPageTemplate locale={locale} messages={messages}>
            <CommoditiesMarketOverview locale={locale} messages={messages} />
            <CommoditiesRecentAnalysis locale={locale} messages={messages} />
        </MarketPageTemplate>
    );
}
