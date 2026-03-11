import React from "react";

type CurrencyItem = {
  code: string;
  name: string;
};

type RateText = {
  forward: string;
  reverse: string;
};

type CurrencyConverterProps = {
  currencyPlaceholder: string;
  currencies: CurrencyItem[];
  loadingCurrencies: boolean;
  fromCurrency: string;
  toCurrency: string;
  fromValue: string;
  toValue: string;
  loadingRate: boolean;
  rate: number | null;
  rateText: RateText | null;
  rateDate: string | null;
  onFromCurrencyChange: (value: string) => void;
  onToCurrencyChange: (value: string) => void;
  onFromValueChange: (value: string) => void;
  onToValueChange: (value: string) => void;
};

export function CurrencyConverter({
  currencyPlaceholder,
  currencies,
  loadingCurrencies,
  fromCurrency,
  toCurrency,
  fromValue,
  toValue,
  loadingRate,
  rate,
  rateText,
  rateDate,
  onFromCurrencyChange,
  onToCurrencyChange,
  onFromValueChange,
  onToValueChange,
}: CurrencyConverterProps) {
  const rateStatus = loadingRate
    ? "Updating rate..."
    : rate
      ? "Live rate"
      : "Rate unavailable";

  return (
    <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-slate-100/60 p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Currency
          </p>
          <h4 className="text-lg font-semibold text-slate-800">Converter</h4>
        </div>
        <div
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            rate
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          {rateStatus}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          <label className="text-xs font-medium text-slate-500">From</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={fromCurrency}
              onChange={(e) => onFromCurrencyChange(e.target.value)}
              disabled={loadingCurrencies}
              className="w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 disabled:cursor-not-allowed disabled:bg-slate-100 sm:w-auto sm:min-w-24"
            >
              {currencies.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}
                </option>
              ))}
            </select>

            <input
              type="text"
              inputMode="decimal"
              placeholder={currencyPlaceholder}
              value={fromValue}
              disabled={loadingRate || !rate}
              onChange={(e) => onFromValueChange(e.target.value)}
              aria-label="From amount"
              className="w-full min-w-0 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/40 disabled:cursor-not-allowed disabled:bg-slate-100 sm:flex-1"
            />
          </div>
        </div>

        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-500 shadow-sm">
          =
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          <label className="text-xs font-medium text-slate-500">To</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={toCurrency}
              onChange={(e) => onToCurrencyChange(e.target.value)}
              disabled={loadingCurrencies}
              className="w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 disabled:cursor-not-allowed disabled:bg-slate-100 sm:w-auto sm:min-w-24"
            >
              {currencies.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}
                </option>
              ))}
            </select>

            <input
              type="text"
              inputMode="decimal"
              placeholder={currencyPlaceholder}
              value={toValue}
              disabled={loadingRate || !rate}
              onChange={(e) => onToValueChange(e.target.value)}
              aria-label="To amount"
              className="w-full min-w-0 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/40 disabled:cursor-not-allowed disabled:bg-slate-100 sm:flex-1"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="space-y-1">
          {loadingCurrencies && <p>Loading currency list...</p>}
          {!loadingCurrencies && currencies.length === 0 && (
            <p>Currency list unavailable.</p>
          )}
          {loadingRate && <p>Loading exchange rate...</p>}
          {!loadingRate && !rate && <p>Exchange rate unavailable.</p>}
        </div>

        {rateText && (
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-700">{rateText.forward}</p>
            <p className="text-slate-500">{rateText.reverse}</p>
            {rateDate && (
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                Rate date {rateDate}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
