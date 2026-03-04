import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { InsightGridSection } from "@/components/organisms/InsightGridSection";
import { InsightSnapshotSection } from "@/components/organisms/InsightSnapshotSection";
import { LiveChartSection } from "@/components/organisms/LiveChartSection";
import { MarketBriefSection } from "@/components/organisms/MarketBriefSection";
import { OutlookSection } from "@/components/organisms/OutlookSection";
import { getMessages, type Locale } from "@/locales";

type CalendarRow = {
  time: string;
  label: string;
};

type SnapshotRow = {
  label: string;
  value: string;
  tone: "up" | "down";
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const copy =
    locale === "en"
      ? {
          briefTitle: "Today's Market Brief",
          briefCta: "Read Full Brief",
          briefItems: [
            "Gold rises as USD softens",
            "Oil stable ahead of OPEC",
            "IDX Composite ticks higher",
          ],
          insightKicker: "Market Insight",
          insightTitle: "Gold rebounds, risk appetite returns?",
          insightBody:
            "Safe-haven demand improves as US inflation expectations cool, easing pressure on yields and the dollar.",
          insightCta: "Read Full Insight",
          snapshotTitle: "Market Snapshot",
          snapshotTabs: ["Today", "Week", "Month", "Quarter"],
          snapshotActiveTab: "Today",
          snapshotHeadline: "6,831.2 +0.45",
          snapshotRows: [
            { label: "IDX Composite", value: "+0.45%", tone: "up" },
            { label: "Gold", value: "+0.33%", tone: "up" },
            { label: "USD / IDR", value: "-0.22%", tone: "down" },
            { label: "Oil $82.15", value: "+0.51%", tone: "up" },
          ] as SnapshotRow[],
          snapshotCta: "View Live Markets",
          liveChartTitle: "Live Chart",
          liveChartTabs: ["Day", "Week", "Month", "YTD"],
          liveChartActiveTab: "Week",
          liveChartSubtabs: [
            "Markets",
            "Commodities",
            "Equities",
            "Forex",
            "Crypto",
          ],
          liveChartActiveSubtab: "Markets",
          liveChartStats: [
            { label: "Gold Spot", value: "XAU/USD -0.23%" },
            { label: "Crude Oil", value: "US OIL +0.31%" },
            { label: "USD/IDR", value: "15,290 -0.39%" },
            { label: "BTC", value: "65,230 +1.11%" },
          ],
          quotesTitle: "Market Quotes",
          quotesItems: [
            "Market Outlook",
            "Economic Calendar",
            "Technical Outlook",
            "Historical Data",
            "Pivot & Fibonacci",
            "Global Indices",
          ],
          quickTitle: "Quick Access",
          quickItems: [
            "Market Outlook",
            "Economic Calendar",
            "Technical Outlook",
          ],
          outlookTitle: "Market Outlook",
          outlookItems: [
            "Brent holds as markets monitor US-Iran tensions",
            "Gold ready for breakout or reversal?",
          ],
          calendarTitle: "Video on TikTok",
          calendarRows: [
            { time: "10:00 WIB", label: "BI Repo Rate" },
            { time: "19:30 WIB", label: "US GDP" },
            { time: "20:45 WIB", label: "Eurozone CPI" },
          ] as CalendarRow[],
          calendarCta: "View Full Calendar",
          insightGridTitle: "Market Insight",
          insightGridItems: [
            "Oil above $80: hold or pullback?",
            "IDX strengthens, which sectors benefit most?",
          ],
          insightGridCta: "Read More",
        }
      : {
          briefTitle: "Today's Market Brief",
          briefCta: "Baca Ringkas",
          briefItems: [
            "Emas naik karena USD melemah",
            "Minyak stabil menjelang OPEC",
            "IHSG menguat tipis",
          ],
          insightKicker: "Market Insight",
          insightTitle: "Emas menguat, investor kembali hindari risiko?",
          insightBody:
            "Permintaan safe-haven meningkat setelah ekspektasi inflasi AS melandai, menekan imbal hasil dan dolar.",
          insightCta: "Baca Insight",
          snapshotTitle: "Market Snapshot",
          snapshotTabs: ["Today", "Week", "Month", "Quarter"],
          snapshotActiveTab: "Today",
          snapshotHeadline: "6,831.2 +0.45",
          snapshotRows: [
            { label: "IDX Composite", value: "+0.45%", tone: "up" },
            { label: "Gold", value: "+0.33%", tone: "up" },
            { label: "USD / IDR", value: "-0.22%", tone: "down" },
            { label: "Oil $82.15", value: "+0.51%", tone: "up" },
          ] as SnapshotRow[],
          snapshotCta: "Lihat Pasar Live",
          liveChartTitle: "Live Chart",
          liveChartTabs: ["Day", "Week", "Month", "YTD"],
          liveChartActiveTab: "Week",
          liveChartSubtabs: [
            "Markets",
            "Commodities",
            "Equities",
            "Forex",
            "Crypto",
          ],
          liveChartActiveSubtab: "Markets",
          liveChartStats: [
            { label: "Gold Spot", value: "XAU/USD -0.23%" },
            { label: "Crude Oil", value: "US OIL +0.31%" },
            { label: "USD/IDR", value: "15,290 -0.39%" },
            { label: "BTC", value: "65,230 +1.11%" },
          ],
          quotesTitle: "Market Quotes",
          quotesItems: [
            "Market Outlook",
            "Economic Calendar",
            "Technical Outlook",
            "Historical Data",
            "Pivot & Fibonacci",
            "Global Indices",
          ],
          quickTitle: "Quick Access",
          quickItems: [
            "Market Outlook",
            "Economic Calendar",
            "Technical Outlook",
          ],
          outlookTitle: "Market Outlook",
          outlookItems: [
            "Brent bertahan, pasar pantau tensi AS-Iran",
            "Emas siap breakout atau reversal?",
          ],
          calendarTitle: "Video on TikTok",
          calendarRows: [
            { time: "10:00 WIB", label: "BI Repo Rate" },
            { time: "19:30 WIB", label: "US GDP" },
            { time: "20:45 WIB", label: "Eurozone CPI" },
          ] as CalendarRow[],
          calendarCta: "Lihat Kalender",
          insightGridTitle: "Market Insight",
          insightGridItems: [
            "Harga minyak di atas $80: bertahan atau koreksi?",
            "IHSG menguat, sektor mana paling diuntungkan?",
          ],
          insightGridCta: "Baca Lainnya",
        };

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <MarketBriefSection
        title={copy.briefTitle}
        items={copy.briefItems}
        ctaLabel={copy.briefCta}
      />

      <InsightSnapshotSection
        insightKicker={copy.insightKicker}
        insightTitle={copy.insightTitle}
        insightBody={copy.insightBody}
        insightCta={copy.insightCta}
        snapshotTitle={copy.snapshotTitle}
        snapshotHeadline={copy.snapshotHeadline}
        snapshotTabs={copy.snapshotTabs}
        snapshotActiveTab={copy.snapshotActiveTab}
        snapshotRows={copy.snapshotRows}
        snapshotCta={copy.snapshotCta}
      />

      <LiveChartSection
        liveChartTitle={copy.liveChartTitle}
        liveChartTabs={copy.liveChartTabs}
        liveChartActiveTab={copy.liveChartActiveTab}
        liveChartSubtabs={copy.liveChartSubtabs}
        liveChartActiveSubtab={copy.liveChartActiveSubtab}
        liveChartStats={copy.liveChartStats}
        quotesTitle={copy.quotesTitle}
        quotesItems={copy.quotesItems}
        quickTitle={copy.quickTitle}
        quickItems={copy.quickItems}
        calendarTitle={copy.calendarTitle}
        calendarRows={copy.calendarRows}
        calendarCta={copy.calendarCta}
      />

      <OutlookSection
        outlookTitle={copy.outlookTitle}
        outlookItems={copy.outlookItems}
        readMoreLabel={messages.common.readMore}
        calendarTitle={copy.calendarTitle}
      />

      <InsightGridSection
        title={copy.insightGridTitle}
        items={copy.insightGridItems}
        ctaLabel={copy.insightGridCta}
        readMoreLabel={messages.common.readMore}
      />
    </MarketPageTemplate>
  );
}
