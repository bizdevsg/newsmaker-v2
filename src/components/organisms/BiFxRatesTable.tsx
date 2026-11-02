import React from "react";
import type { Locale } from "@/locales";
import { formatJakartaDate } from "@/lib/date-time";
import { getFx } from "@/lib/endpo.server";

type BiFxRatesTableProps = {
  locale: Locale;
};

const formatAmount = (value: number | undefined, locale: Locale) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export async function BiFxRatesTable({ locale }: BiFxRatesTableProps) {
  const { data: fxResponse } = await getFx();
  const rows = Array.isArray(fxResponse?.data) ? fxResponse.data : [];

  return (
    <section className="mt-3 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between w-full gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            {locale === "en" ? "BI Exchange Rates" : "Kurs Transaksi BI"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {locale === "en"
              ? "Bank Indonesia transaction rates against the rupiah."
              : "Kurs transaksi Bank Indonesia terhadap rupiah."}
          </p>
        </div>

        {fxResponse?.fetched_at ? (
          <div className="text-sm text-right text-slate-500">
            <p className="font-semibold text-slate-700">
              {locale === "en" ? "Updated" : "Diperbarui"}
            </p>
            <p>
              {formatJakartaDate(fxResponse.fetched_at, locale, {
                day: "2-digit",
                month: "long",
                year: "numeric",
                fallback: fxResponse.fetched_at,
              })}
            </p>
          </div>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-500">
            {locale === "en"
              ? "Exchange rate data unavailable."
              : "Data kurs belum tersedia."}
          </p>
        </div>
      ) : (
        <div className="mt-6 max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0">
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">
                  {locale === "en" ? "Currency" : "Mata Uang"}
                </th>
                <th className="px-4 py-3 text-right">Unit</th>
                <th className="px-4 py-3 text-right">
                  {locale === "en" ? "Sell" : "Jual"}
                </th>
                <th className="px-4 py-3 text-right">
                  {locale === "en" ? "Buy" : "Beli"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.currency ?? index}
                  className="border-t border-slate-100 hover:bg-slate-50/70"
                >
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {row.currency ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {row.unit ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-800">
                    {formatAmount(row.sell, locale)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-800">
                    {formatAmount(row.buy, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fxResponse?.source ? (
        <div className="mt-4 text-right text-sm text-slate-600">
          <span className="font-semibold text-slate-700">
            {locale === "en" ? "Source" : "Sumber"}:
          </span>{" "}
          <a
            href={fxResponse.source}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
          >
            Bank Indonesia
          </a>
        </div>
      ) : null}
    </section>
  );
}
