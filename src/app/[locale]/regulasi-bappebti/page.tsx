import type { Metadata } from "next";
import { BappebtiRegulationTable } from "@/components/organisms/BappebtiRegulationTable";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";

const parseCategoryParam = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) return undefined;
  const normalized = rawValue.trim();
  return normalized || undefined;
};

const parsePageParam = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(rawValue ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";

  return {
    title: locale === "en" ? "Bappebti Regulations" : "Regulasi Bappebti",
  };
}

export default async function BappebtiRegulationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<{ kategori?: string | string[]; page?: string | string[] }>;
}) {
  const { locale: rawLocale } = await params;
  const resolvedSearchParams = await searchParams;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const selectedCategoryKey = parseCategoryParam(resolvedSearchParams.kategori);
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
      <BappebtiRegulationTable
        locale={locale}
        selectedCategoryKey={selectedCategoryKey}
        page={page}
      />
    </MarketPageTemplate>
  );
}
