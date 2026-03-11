import { getMessages, type Locale } from "@/locales";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { NewsCategoryList } from "@/components/organisms/NewsCategoryList";

// Category-to-ID mapping for economic news
const ECONOMIC_SLUG_LABELS: Record<string, string> = {
    "economy": "Global & Economy",
    "fiscal-moneter": "Fiscal & Monetary",
};

export default async function EconomicNewsCategoryPage({
    params,
}: {
    params: Promise<{ locale?: string; category: string }>;
}) {
    const { locale: rawLocale, category } = await params;
    const locale: Locale = rawLocale === "en" ? "en" : "id";
    const messages = getMessages(locale);

    const label = ECONOMIC_SLUG_LABELS[category] ?? category;

    const customMessages = {
        ...messages,
        header: {
            ...messages.header,
            activeNavKey: "markets",
        },
    };

    return (
        <MarketPageTemplate locale={locale} messages={customMessages}>
            <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100 min-h-[60vh]">
                <NewsCategoryList categorySlug={category} locale={locale} messages={customMessages} />
            </section>
        </MarketPageTemplate>
    );
}
