import { permanentRedirect } from "next/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "id";

  permanentRedirect(`/${locale}`);
}
