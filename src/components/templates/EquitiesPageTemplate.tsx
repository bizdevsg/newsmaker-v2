import React from "react";
import { MarketPageTemplate } from "./MarketPageTemplate";
import { EquitiesMarketOverview } from "../organisms/EquitiesMarketOverview";
import { EquitiesKeySectors } from "../organisms/EquitiesKeySectors";
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
            <EquitiesKeySectors messages={messages} />
        </MarketPageTemplate>
    );
}
