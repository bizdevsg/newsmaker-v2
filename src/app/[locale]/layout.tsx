import { notFound } from "next/navigation";
import { LoadingProvider } from "@/components/providers/LoadingProvider";

const locales = ["en", "id"] as const;

type Locale = (typeof locales)[number];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale?.toLowerCase();

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return <LoadingProvider>{children}</LoadingProvider>;
}
