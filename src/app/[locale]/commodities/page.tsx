import { getMessages, type Locale } from "@/locales";
import { CommoditiesPageTemplate } from "@/components/templates/CommoditiesPageTemplate";

type PageProps = {
    params: {
        locale: Locale;
    };
};

export default async function CommoditiesPage({
    params,
}: {
    params: Promise<{ locale?: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = rawLocale === "en" ? "en" : "id";
    const baseMessages = getMessages(locale);

    // Override activeNavKey for Header similar to Equities
    const messages = {
        ...baseMessages,
        header: {
            ...baseMessages.header,
            activeNavKey: "commodities"
        }
    };

    return <CommoditiesPageTemplate locale={locale} messages={messages} />;
}
