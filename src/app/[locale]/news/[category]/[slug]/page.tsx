import { getMessages, type Locale } from "@/locales";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { NewsArticleDetail } from "@/components/organisms/NewsArticleDetail";

export default async function NewsArticlePage({
    params,
}: {
    params: Promise<{ locale?: string; category: string; slug: string }>;
}) {
    const { locale: rawLocale, category, slug } = await params;
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
            <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100 min-h-[80vh]">
                <NewsArticleDetail
                    slug={slug}
                    categorySlug={category}
                    locale={locale}
                    isEconomic={false}
                />
            </section>
        </MarketPageTemplate>
    );
}
