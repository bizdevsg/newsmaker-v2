"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Messages } from "@/locales";
import { CurrencyConverter } from "../molecules/CurrencyConverter";
import { Pagination } from "../molecules/Pagination";

type CurrencyItem = {
  code: string;
  name: string;
};

type PivotHistoryItem = {
  id: number;
  tanggal: string;
  open: string | number | null;
  high: string | number | null;
  low: string | number | null;
  close: string | number | null;
  chg?: string | null;
  isBankHoliday?: boolean;
  description?: string | null;
  category?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  volume?: string | number | null;
  open_interest?: string | number | null;
};

type HistoricRow = {
  d: string;
  o: string;
  h: string;
  l: string;
  c: string;
  isBankHoliday?: boolean;
  description?: string | null;
};

type PivotFibonacciHistoryProps = {
  messages: Messages;
  historyRows: PivotHistoryItem[];
  loadingHistory: boolean;
  historyError: string | null;
  currencies: CurrencyItem[];
  loadingCurrencies: boolean;
  fromCurrency: string;
  toCurrency: string;
  fromValue: string;
  toValue: string;
  loadingRate: boolean;
  rate: number | null;
  rateText: { forward: string; reverse: string } | null;
  rateDate: string | null;
  onFromCurrencyChange: (value: string) => void;
  onToCurrencyChange: (value: string) => void;
  onFromValueChange: (value: string) => void;
  onToValueChange: (value: string) => void;
  perPage?: number;
};

export function PivotFibonacciHistory({
  messages,
  historyRows,
  loadingHistory,
  historyError,
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
  perPage = 10,
}: PivotFibonacciHistoryProps) {
  const historicData = messages.policy.historicData;
  const [selectedCategory, setSelectedCategory] = useState<string>("LGD Daily");
  const [page, setPage] = useState(1);

  const formatHistoryNumber = (value: string | number | null): string => {
    if (value === null || value === undefined) return "-";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return String(value);
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(numeric);
  };

  const formatHistoryDate = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parsed);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    historyRows.forEach((row) => {
      if (row.category) set.add(row.category);
    });
    const priority = ["LGD", "BCO", "HSI", "SNI", "LSI", "AUD/USD"];
    const getRank = (value: string) => {
      const upper = value.toUpperCase();
      return priority.findIndex((item) => upper.startsWith(item));
    };

    return Array.from(set).sort((a, b) => {
      const aRank = getRank(a);
      const bRank = getRank(b);

      if (aRank !== -1 || bRank !== -1) {
        if (aRank === -1) return 1;
        if (bRank === -1) return -1;
        if (aRank !== bRank) return aRank - bRank;
      }

      return a.localeCompare(b);
    });
  }, [historyRows]);

  useEffect(() => {
    if (!categories.length) return;
    if (categories.includes(selectedCategory)) return;
    setSelectedCategory(categories[0]);
  }, [categories, selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const filteredRows = useMemo(() => {
    const list = selectedCategory
      ? historyRows.filter((row) => row.category === selectedCategory)
      : historyRows;

    return [...list].sort((a, b) => {
      const aDate = new Date(a.tanggal).getTime();
      const bDate = new Date(b.tanggal).getTime();
      return bDate - aDate;
    });
  }, [historyRows, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const rows: HistoricRow[] = filteredRows
    .slice((page - 1) * perPage, page * perPage)
    .map((row) => ({
      d: formatHistoryDate(row.tanggal),
      o: formatHistoryNumber(row.open),
      h: formatHistoryNumber(row.high),
      l: formatHistoryNumber(row.low),
      c: formatHistoryNumber(row.close),
      isBankHoliday: row.isBankHoliday,
      description: row.description,
    }));

  return (
    <div className="mt-10 pt-8 border-t border-slate-200 space-y-6">
      <div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none text-slate-700 bg-white min-w-[140px] shadow-sm"
        >
          {categories.length === 0 && <option>Loading...</option>}
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full border-separate border-spacing-0 text-left text-sm text-slate-700 [&_td+td]:border-l [&_td+td]:border-slate-100 [&_th+th]:border-l [&_th+th]:border-slate-200">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-bold tracking-tight text-slate-800">
                {historicData.columns[0]}
              </th>
              <th className="py-3 px-4 font-bold tracking-tight text-slate-800">
                {historicData.columns[1]}
              </th>
              <th className="py-3 px-4 font-bold tracking-tight text-slate-800">
                {historicData.columns[2]}
              </th>
              <th className="py-3 px-4 font-bold tracking-tight text-slate-800">
                {historicData.columns[3]}
              </th>
              <th className="py-3 px-4 font-bold tracking-tight text-slate-800">
                {historicData.columns[4]}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loadingHistory && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  Loading history data...
                </td>
              </tr>
            )}
            {!loadingHistory && historyError && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  {historyError}
                </td>
              </tr>
            )}
            {!loadingHistory && !historyError && rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No data available.
                </td>
              </tr>
            )}
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={`transition-colors odd:bg-white even:bg-slate-50/70 hover:bg-slate-100/70 ${
                  row.isBankHoliday ? "text-slate-500" : ""
                }`}
              >
                {row.isBankHoliday ? (
                  <>
                    <td className="py-3 px-4 font-medium">{row.d}</td>
                    <td
                      colSpan={4}
                      className="py-3 px-4 text-sm font-medium text-slate-600 text-center capitalize"
                    >
                      {row.description || "Bank holiday"}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 font-medium">{row.d}</td>
                    <td className="py-3 px-4 tabular-nums">{row.o}</td>
                    <td className="py-3 px-4 tabular-nums">{row.h}</td>
                    <td className="py-3 px-4 tabular-nums">{row.l}</td>
                    <td className="py-3 px-4 tabular-nums">{row.c}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="py-2"
      />

      <CurrencyConverter
        currencyPlaceholder={historicData.currencyValue}
        currencies={currencies}
        loadingCurrencies={loadingCurrencies}
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        fromValue={fromValue}
        toValue={toValue}
        loadingRate={loadingRate}
        rate={rate}
        rateText={rateText}
        rateDate={rateDate}
        onFromCurrencyChange={onFromCurrencyChange}
        onToCurrencyChange={onToCurrencyChange}
        onFromValueChange={onFromValueChange}
        onToValueChange={onToValueChange}
      />
    </div>
  );
}
