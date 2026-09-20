import type { Metadata } from "next";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";
import { fetchIcdxVolume } from "@/lib/icdx-volume.server";
import { IcdxVolumeChart } from "@/components/organisms/IcdxVolumeChart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";

  return {
    title: locale === "en" ? "ICDX Volume Activity" : "Aktivitas Volume ICDX",
  };
}

export default async function IcdxVolumePage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);
  const data = await fetchIcdxVolume();

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
        <IcdxVolumeChart locale={locale} messages={customMessages} data={data} />
      </section>
    </MarketPageTemplate>
  );
}
