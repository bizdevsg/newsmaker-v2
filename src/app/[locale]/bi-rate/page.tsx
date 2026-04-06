import type { Metadata } from "next";
import { BiRateTable } from "@/components/organisms/BiRateTable";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "BI-Rate",
};

const parsePageParam = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(rawValue ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
};

export default async function BiRatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { locale: rawLocale } = await params;
  const resolvedSearchParams = await searchParams;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const page = parsePageParam(resolvedSearchParams.page);
  const messages = getMessages(locale);

  const customMessages = {
    ...messages,
    header: {
      ...messages.header,
      activeNavKey: "policy",
    },
  };

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <BiRateTable messages={customMessages} locale={locale} page={page} />
    </MarketPageTemplate>
  );
}
