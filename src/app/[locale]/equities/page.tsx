import { MarketPageTemplate } from "../../../components/templates/MarketPageTemplate";
import { EquitiesMarketOverview } from "../../../components/organisms/EquitiesMarketOverview";
import { EquitiesKeySectors } from "../../../components/organisms/EquitiesKeySectors";
import { getMessages, type Locale } from "@/locales";

export default async function EquitiesPage({
    params,
}: {
    params: Promise<{ locale?: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = rawLocale === "en" ? "en" : "id";
    const messages = getMessages(locale);

    // Override activeNavKey for Header
    const customMessages = {
        ...messages,
        header: {
            ...messages.header,
            activeNavKey: "equities"
        }
    };

    return (
        <MarketPageTemplate locale={locale} messages={customMessages}>
            <EquitiesMarketOverview messages={customMessages} />
            <EquitiesKeySectors messages={customMessages} />
        </MarketPageTemplate>
    );
}
