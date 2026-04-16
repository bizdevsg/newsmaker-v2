import type { Metadata } from "next";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { NewsListView } from "@/components/organisms/news/NewsListView";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import type { NewsCardItem } from "@/lib/news-cards";
import {
  getSearchQueryFromSegments,
  normalizeSearchQuery,
} from "@/lib/portalnews-search";
import { searchPortalNews } from "@/lib/portalnews-search.server";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Search",
};

const formatDateShort = (value: string | undefined, locale: Locale) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeAssetUrl = (value: string) => value.replace(/ /g, "%20");

const toTimestamp = (value: string) => {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
};

const resolveQuery = async (
  searchParams:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>
    | undefined,
  segments: string[] | undefined,
) => {
  const resolvedSearchParams = searchParams
    ? await Promise.resolve(searchParams)
    : null;

  const queryParam = resolvedSearchParams?.q;
  const fromQueryParam =
    typeof queryParam === "string" ? normalizeSearchQuery(queryParam) : "";
  if (fromQueryParam) return fromQueryParam;

  return getSearchQueryFromSegments(segments);
};

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: string; segments?: string[] }>;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { locale: rawLocale, segments } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const query = await resolveQuery(searchParams, segments);

  const title =
    locale === "en"
      ? query
        ? `Search: ${query}`
        : "Search"
      : query
        ? `Pencarian: ${query}`
        : "Pencarian";

  const results = query ? await searchPortalNews(query, locale) : [];

  const cards: NewsCardItem[] = results.map((item, index) => ({
    key: String(item.id ?? `search-${index}`),
    title: item.title,
    summary: item.summary,
    tag: item.category,
    date: formatDateShort(item.date, locale),
    image: item.image ? normalizeAssetUrl(item.image) : null,
    href: item.href,
    timestamp: toTimestamp(item.date),
  }));

  const homeLabel = String(messages.header.siteNav.home ?? "Home");

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8">
        <Card className="overflow-hidden">
          <NewsListView
            title={title}
            locale={locale}
            breadcrumb={[
              { label: homeLabel, href: `/${locale}` },
              { label: locale === "en" ? "Search" : "Pencarian" },
              ...(query ? [{ label: query }] : []),
            ]}
            items={cards}
            backHref={`/${locale}`}
            backLabel={locale === "en" ? "Back" : "Kembali"}
            emptyMessage={
              query
                ? locale === "en"
                  ? `No results for "${query}".`
                  : `Tidak ada hasil untuk "${query}".`
                : locale === "en"
                  ? "Type a search term in the header."
                  : "Ketik kata kunci di kolom pencarian (header)."
            }
          />
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}

