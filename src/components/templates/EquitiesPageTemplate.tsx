import React from "react";
import { MarketPageTemplate } from "./MarketPageTemplate";
import { EquitiesMarketOverview } from "../organisms/EquitiesMarketOverview";
import { NewsCategories } from "../organisms/NewsCategories";
import type { Locale, Messages } from "@/locales";

type EquitiesPageTemplateProps = {
    locale: Locale;
    messages: Messages;
};

export function EquitiesPageTemplate({
    locale,
    messages,
}: EquitiesPageTemplateProps) {
    return (
        <MarketPageTemplate locale={locale} messages={messages}>
            <EquitiesMarketOverview messages={messages} />
            <NewsCategories locale={locale} messages={messages} />
        </MarketPageTemplate>
    );
}
