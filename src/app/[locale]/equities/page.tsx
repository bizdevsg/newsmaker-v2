import { EquitiesPageTemplate } from "../../../components/templates/EquitiesPageTemplate";
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

    return <EquitiesPageTemplate locale={locale} messages={customMessages} />;
}
