import type { Metadata } from "next";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";
import { fetchJfxVolume } from "@/lib/jfx-volume.server";
import { BbjVolumeChart } from "@/components/organisms/BbjVolumeChart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";

  return {
    title:
      locale === "en"
        ? "BBJ Volume Activity"
        : "Aktivitas Volume BBJ",
  };
}

export default async function BbjVolumePage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);
  const data = await fetchJfxVolume();

  const customMessages = {
    ...messages,
    header: {
      ...messages.header,
      activeNavKey: "policy",
    },
  };

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <section className="min-h-[60vh]">
        <BbjVolumeChart locale={locale} messages={customMessages} data={data} />
      </section>
    </MarketPageTemplate>
  );
}
