import { redirect } from "next/navigation";

export default async function LocaleCatchAllPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "id";

  redirect(`/${locale}`);
}
