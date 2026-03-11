import React from "react";
import { MarketPageTemplate } from "./MarketPageTemplate";
import { PolicyQuickData } from "../organisms/PolicyQuickData";
import { RegulatoryWatch } from "../organisms/RegulatoryWatch";
import { PolicySnapshot } from "../organisms/PolicySnapshot";
import type { Locale, Messages } from "@/locales";

type PolicyPageTemplateProps = {
    locale: Locale;
    messages: Messages;
};

export function PolicyPageTemplate({
    locale,
    messages,
}: PolicyPageTemplateProps) {
    return (
        <MarketPageTemplate locale={locale} messages={messages}>
            <div className="grid gap-6">
                <PolicyQuickData messages={messages} />

                <h3 className="text-2xl font-semibold tracking-tight text-slate-800 -mb-2 mt-4 px-1">
                    Policy Updates & Insights
                </h3>
                <div className="grid gap-6 grid-cols-1">
                    <PolicySnapshot messages={messages} locale={locale} />
                    <RegulatoryWatch messages={messages} />
                </div>
            </div>
        </MarketPageTemplate>
    );
}
