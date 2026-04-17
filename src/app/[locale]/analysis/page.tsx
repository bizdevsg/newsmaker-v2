import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Analysis",
};

export default async function AnalysisIndexPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  await params;
  notFound();
}
