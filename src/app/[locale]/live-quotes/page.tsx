import type { Metadata } from "next";
import { LiveQuotesBoard } from "@/components/organisms/LiveQuotesBoard";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";
import { LiveQoutesBoardsCard } from "@/components/organisms/LiveQoutesBoardsCard";

export const metadata: Metadata = {
  title: "All Live Quotes",
};

export default async function LiveQuotesPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const customMessages = {
    ...messages,
    header: {
      ...messages.header,
      activeNavKey: "markets",
    },
  };

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {messages.focusReport.kicker}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {messages.focusReport.pageTitle}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {messages.focusReport.pageSubtitle}
          </p>
        </div>

        <div className="mt-6">
          <LiveQoutesBoardsCard
            messages={customMessages}
            title={messages.focusReport.title}
            subtitle={messages.focusReport.subtitle}
          />
        </div>
      </section>
    </MarketPageTemplate>
  );
}
