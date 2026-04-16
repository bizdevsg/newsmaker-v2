import type { Metadata } from "next";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { PivotFibonacciClient } from "@/components/organisms/pivot-fibonacci/PivotFibonacciClient";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Pivot & Fibonacci",
};

export default async function PivotFibonacciPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const pageTitle =
    messages.header.siteNav.pivotFibonacci?.trim() || "Pivot & Fibonacci";

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <Card className="overflow-hidden">
          <SectionHeader title={pageTitle} />
          <div className="px-4 pb-6">
            <PivotFibonacciClient messages={messages} locale={locale} />
          </div>

          <div className="p-4 pt-0">
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-auto">
                <table className="min-w-[560px] w-full border-separate border-spacing-0 text-sm">
                  <caption className="sr-only">Sample OHLC data</caption>
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-semibold text-slate-700">
                      <th
                        scope="col"
                        className="sticky left-0 z-10 bg-slate-50 px-4 py-3 border-b border-slate-200"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 border-b border-slate-200"
                      >
                        Open
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 border-b border-slate-200"
                      >
                        High
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 border-b border-slate-200"
                      >
                        Low
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 border-b border-slate-200"
                      >
                        Close
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr className="group border-b border-slate-100 hover:bg-slate-50">
                      <td className="sticky left-0 bg-white px-4 py-3 font-semibold border-b border-slate-100 text-slate-900 group-hover:bg-slate-50">
                        2024-06-01
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                        100.00
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                        110.00
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                        90.00
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                        105.00
                      </td>
                    </tr>
                    <tr className="group border-b border-slate-100 hover:bg-slate-50">
                      <td className="sticky left-0 bg-white px-4 py-3 font-semibold border-b border-slate-100 text-slate-900 group-hover:bg-slate-50">
                        2024-06-02
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                        105.00
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                        115.00
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                        95.00
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                        110.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </MarketPageTemplate>
  );
}
