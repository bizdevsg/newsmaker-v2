import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import TradingViewWidget from "./TradingViewWidget";
import type { Locale } from "@/locales";

export function LiveChartClient({
  locale,
  title,
}: {
  locale: Locale;
  title: string;
}) {
  return (
    <Card className="overflow-hidden">
      <SectionHeader title={title} />
      <div className="p-4 h-[75vh] min-h-[560px]">
        <TradingViewWidget locale={locale} />
      </div>
    </Card>
  );
}
