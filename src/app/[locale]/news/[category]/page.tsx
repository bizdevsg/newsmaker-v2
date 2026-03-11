import { getMessages, type Locale } from "@/locales";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { NewsCategoryList } from "@/components/organisms/NewsCategoryList";

export default async function NewsCategoryPage({
    params,
}: {
    params: Promise<{ locale?: string; category: string }>;
}) {
    const { locale: rawLocale, category } = await params;
    const locale: Locale = rawLocale === "en" ? "en" : "id";
    const messages = getMessages(locale);

    const customMessages = {
        ...messages,
        header: {
            ...messages.header,
            activeNavKey: "equities",
        },
    };

    return (
        <MarketPageTemplate locale={locale} messages={customMessages}>
            <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100 min-h-[60vh]">
                <NewsCategoryList
                    categorySlug={category}
                    locale={locale}
                    messages={customMessages}
                    emptyLabel="Data belum tersedia"
                />
            </section>
        </MarketPageTemplate>
    );
}
