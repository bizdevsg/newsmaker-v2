import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Analysis",
};

export default async function AnalysisIndexPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const _locale: Locale = rawLocale === "en" ? "en" : "id";
  notFound();
}
