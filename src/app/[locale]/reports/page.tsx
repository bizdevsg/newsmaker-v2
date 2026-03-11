import { MarketPageTemplate } from "../../../components/templates/MarketPageTemplate";
import { ReportCategories } from "../../../components/organisms/ReportCategories";
import { FocusReport } from "../../../components/organisms/FocusReport";
import { RecentAnalysis } from "../../../components/organisms/RecentAnalysis";
import { getMessages, type Locale } from "@/locales";

export default async function ReportsPage({
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
      activeNavKey: "reports",
    },
  };

  return (
    <MarketPageTemplate locale={locale} messages={customMessages}>
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight text-blue-900 mb-2">
          {messages.header.reports}
        </h2>
        <p className="text-slate-500 font-medium max-w-2xl">
          {messages.focusReport.subtitle}
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <ReportCategories messages={customMessages} />
          <RecentAnalysis messages={customMessages} locale={locale} limit={2} />
        </div>
        <div className="space-y-8">
          <FocusReport messages={customMessages} />
        </div>
      </div>
    </MarketPageTemplate>
  );
}
