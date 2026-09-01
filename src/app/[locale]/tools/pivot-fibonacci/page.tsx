import type { Metadata } from "next";

import { Card } from "@/components/atoms/Card";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { PivotFibonacciClient } from "@/components/organisms/pivot-fibonacci/PivotFibonacciClient";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { fetchHistoricalData } from "@/lib/historical-data";
import { getMessages, type Locale } from "@/locales";

export const metadata: Metadata = {
  title: "Pivot & Fibonacci",
};

// Same source as the Historical Data tool (LGD Daily = Gold). No `limit` is
// passed here on purpose - the API truncates from the oldest row first, so
// we fetch everything for the category and take the most recent rows
// ourselves after sorting.
const OHLC_SAMPLE_CATEGORY = "LGD Daily";
const OHLC_SAMPLE_ROWS = 10;

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

  const ohlcRows = (
    await fetchHistoricalData({ category: OHLC_SAMPLE_CATEGORY })
  )
    .slice()
    .sort((a, b) => Date.parse(b.tanggal) - Date.parse(a.tanggal))
    .slice(0, OHLC_SAMPLE_ROWS);

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="py-8 px-4">
        <Card className="overflow-hidden">
          <SectionHeader title={pageTitle} />
          <div className="px-4 pb-6">
            <PivotFibonacciClient messages={messages} locale={locale} />
          </div>

          <div className="p-4 pt-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {locale === "en"
                ? `Recent OHLC data (${OHLC_SAMPLE_CATEGORY})`
                : `Data OHLC terbaru (${OHLC_SAMPLE_CATEGORY})`}
            </p>
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-auto">
                <table className="min-w-[560px] w-full border-separate border-spacing-0 text-sm">
                  <caption className="sr-only">
                    {`Recent OHLC data - ${OHLC_SAMPLE_CATEGORY}`}
                  </caption>
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
                        className="px-4 py-3 border-b border-slate-200 text-right"
                      >
                        Open
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 border-b border-slate-200 text-right"
                      >
                        High
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 border-b border-slate-200 text-right"
                      >
                        Low
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 border-b border-slate-200 text-right"
                      >
                        Close
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {ohlcRows.length ? (
                      ohlcRows.map((row) => (
                        <tr
                          key={row.id}
                          className="group border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="sticky left-0 bg-white px-4 py-3 font-semibold border-b border-slate-100 text-slate-900 group-hover:bg-slate-50">
                            {row.tanggal}
                          </td>
                          <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                            {row.open ?? "-"}
                          </td>
                          <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                            {row.high ?? "-"}
                          </td>
                          <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                            {row.low ?? "-"}
                          </td>
                          <td className="px-4 py-3 border-b border-slate-100 tabular-nums text-right">
                            {row.close ?? "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-slate-500"
                        >
                          {locale === "en"
                            ? "No data available."
                            : "Data belum tersedia."}
                        </td>
                      </tr>
                    )}
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
