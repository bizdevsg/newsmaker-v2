import type { Metadata } from "next";
import { SearchResultsSection } from "@/components/organisms/SearchResultsSection";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import {
  getSearchQueryFromSegments,
  searchPortalNews,
} from "@/lib/portalnews-search";
import { getMessages, type Locale } from "@/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string; query?: string[] }>;
}): Promise<Metadata> {
  const { locale: rawLocale, query: rawQuery } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const query = getSearchQueryFromSegments(rawQuery);

  return {
    title:
      locale === "en"
        ? `Search results for "${query}"`
        : `Hasil pencarian untuk "${query}"`,
    description:
      locale === "en"
        ? `Search results for ${query}.`
        : `Hasil pencarian untuk ${query}.`,
  };
}

export default async function SearchResultsPage({
  params,
}: {
  params: Promise<{ locale?: string; query?: string[] }>;
}) {
  const { locale: rawLocale, query: rawQuery } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const query = getSearchQueryFromSegments(rawQuery);
  const results = await searchPortalNews(query, locale);
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
      <SearchResultsSection
        locale={locale}
        messages={customMessages}
        query={query}
        results={results}
      />
    </MarketPageTemplate>
  );
}
