import { PolicyPageTemplate } from "../../../components/templates/PolicyPageTemplate";
import { getMessages, type Locale } from "@/locales";

export default async function PolicyPage({
    params,
}: {
    params: Promise<{ locale?: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = rawLocale === "en" ? "en" : "id";
    const messages = getMessages(locale);

    const customMessages = {
        ...messages,
        header: {
            ...messages.header,
            activeNavKey: "policy"
        }
    };

    return <PolicyPageTemplate locale={locale} messages={customMessages} />;
}
