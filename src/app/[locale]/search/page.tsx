import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SearchResultsSection } from "@/components/organisms/SearchResultsSection";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { buildSearchPath, normalizeSearchQuery } from "@/lib/portalnews-search";
import { getMessages, type Locale } from "@/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";

  return {
    title: locale === "en" ? "Search" : "Pencarian",
    description:
      locale === "en"
        ? "Search market news and analysis."
        : "Cari berita dan analisis pasar.",
  };
}

export default async function SearchIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const resolvedSearchParams = await searchParams;
  const query = normalizeSearchQuery(resolvedSearchParams.q);

  if (query) {
    redirect(buildSearchPath(locale, query));
  }

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
        query=""
        results={[]}
      />
    </MarketPageTemplate>
  );
}
