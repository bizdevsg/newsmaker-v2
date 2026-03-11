"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Messages } from "@/locales";
import { Button } from "../atoms/Button";
import { CurrencyConverter } from "../molecules/CurrencyConverter";
import { Pagination } from "../molecules/Pagination";
import { useLoading } from "../providers/LoadingProvider";

type PolicyHistoricDataProps = {
  messages: Messages;
  locale: string;
};

type CurrencyItem = {
  code: string;
  name: string;
};

type FxResponse = {
  source?: string;
  date?: string | null;
  from?: string;
  to?: string;
  amount?: number;
  rate?: number;
  result?: number;
};

type CurrenciesResponse = {
  source?: string;
  count?: number;
  currencies?: CurrencyItem[];
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

type PivotHistoryResponse = {
  Code?: number;
  status?: string;
  data?: PivotHistoryItem[];
};

type LastEdited = "from" | "to";

export function PolicyHistoricData({ messages, locale }: PolicyHistoricDataProps) {
  const loading = useLoading();
  const data = messages.policy.historicData;
  const initialCurrenciesLoad = useRef(true);
  const initialRateLoad = useRef(true);
  const initialHistoryLoad = useRef(true);

  const [page, setPage] = useState(1);

  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("IDR");

  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("");

  const [rate, setRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  const [lastEdited, setLastEdited] = useState<LastEdited>("from");

  const [historyRows, setHistoryRows] = useState<PivotHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("LGD Daily");

  const perPage = 20;

  const zeroDecimalCurrencies = useMemo(
    () => new Set(["IDR", "JPY", "KRW", "VND"]),
    [],
  );

  const parseInput = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    let normalized = trimmed.replace(/\s+/g, "");

    const hasComma = normalized.includes(",");
    const hasDot = normalized.includes(".");

    if (hasComma && hasDot) {
      if (normalized.lastIndexOf(".") < normalized.lastIndexOf(",")) {
        // format ID: 16.983,50
        normalized = normalized.replace(/\./g, "").replace(",", ".");
      } else {
        // format US: 16,983.50
        normalized = normalized.replace(/,/g, "");
      }
    } else if (hasComma) {
      const commaParts = normalized.split(",");

      if (commaParts.length === 2 && commaParts[1].length === 3) {
        // 16,983
        normalized = normalized.replace(/,/g, "");
      } else {
        // 16,98
        normalized = normalized.replace(",", ".");
      }
    } else if (hasDot) {
      const dotParts = normalized.split(".");

      if (dotParts.length === 2 && dotParts[1].length === 3) {
        // 16.983
        normalized = normalized.replace(/\./g, "");
      }
    }

    normalized = normalized.replace(/[^\d.-]/g, "");

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatValue = (value: number, currency: string): string => {
    if (!Number.isFinite(value)) return "";

    const isZeroDecimal = zeroDecimalCurrencies.has(currency);
    const localeStr = currency === "IDR" ? "id-ID" : "en-US";

    return new Intl.NumberFormat(localeStr, {
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(value);
  };

  const formatHistoryNumber = (value: string | number | null): string => {
    if (value === null || value === undefined) return "-";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return String(value);
    return new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(numeric);
  };

  const formatHistoryDate = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parsed);
  };

  const convert = (amount: number, from: string, to: string): number | null => {
    if (!Number.isFinite(amount)) return null;
    if (from === to) return amount;
    if (!rate || rate <= 0) return null;

    if (from === fromCurrency && to === toCurrency) {
      return amount * rate;
    }

    if (from === toCurrency && to === fromCurrency) {
      return amount / rate;
    }

    return null;
  };

  const recalcValue = (
    amountValue: string,
    from: string,
    to: string,
  ): string => {
    const parsed = parseInput(amountValue);
    if (parsed === null) return "";

    const converted = convert(parsed, from, to);
    if (converted === null) return "";

    return formatValue(converted, to);
  };

  useEffect(() => {
    let isActive = true;

    const fetchCurrencies = async () => {
      const token = initialCurrenciesLoad.current
        ? loading.start("policy-currencies")
        : null;
      try {
        setLoadingCurrencies(true);

        const response = await fetch("/api/fx/currencies", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (isActive) setCurrencies([]);
          return;
        }

        const json = (await response.json()) as CurrenciesResponse;

        if (isActive && Array.isArray(json.currencies)) {
          setCurrencies(json.currencies);
        }
      } catch {
        if (isActive) {
          setCurrencies([]);
        }
      } finally {
        if (isActive) {
          setLoadingCurrencies(false);
        }
        if (token) loading.stop(token);
        initialCurrenciesLoad.current = false;
      }
    };

    fetchCurrencies();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchHistory = async () => {
      const token = initialHistoryLoad.current
        ? loading.start("policy-history")
        : null;
      try {
        setLoadingHistory(true);
        setHistoryError(null);

        const response = await fetch("/api/pivot-history", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (isActive) {
            setHistoryRows([]);
            setHistoryError(locale === "id" ? "Gagal memuat data historis." : "Failed to load history data.");
          }
          return;
        }

        const json = (await response.json()) as PivotHistoryResponse;
        const items = Array.isArray(json.data) ? json.data : [];

        if (isActive) {
          setHistoryRows(items);
        }
      } catch {
        if (isActive) {
          setHistoryRows([]);
          setHistoryError(locale === "id" ? "Gagal memuat data historis." : "Failed to load history data.");
        }
      } finally {
        if (isActive) {
          setLoadingHistory(false);
        }
        if (token) loading.stop(token);
        initialHistoryLoad.current = false;
      }
    };

    fetchHistory();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchRate = async () => {
      const token = initialRateLoad.current
        ? loading.start("policy-rate")
        : null;
      try {
        setLoadingRate(true);

        const response = await fetch(
          `/api/fx?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}&amount=1`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          if (isActive) {
            setRate(null);
            setRateDate(null);
          }
          return;
        }

        const json = (await response.json()) as FxResponse;

        if (
          isActive &&
          typeof json.rate === "number" &&
          Number.isFinite(json.rate)
        ) {
          setRate(json.rate);
          setRateDate(json.date ?? null);
        } else if (isActive) {
          setRate(null);
          setRateDate(null);
        }
      } catch {
        if (isActive) {
          setRate(null);
          setRateDate(null);
        }
      } finally {
        if (isActive) {
          setLoadingRate(false);
        }
        if (token) loading.stop(token);
        initialRateLoad.current = false;
      }
    };

    fetchRate();

    return () => {
      isActive = false;
    };
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (lastEdited === "from") {
      setToValue(recalcValue(fromValue, fromCurrency, toCurrency));
    } else {
      setFromValue(recalcValue(toValue, toCurrency, fromCurrency));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency, rate]);

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

  const rateText =
    rate && rate > 0
      ? {
        forward: `1 ${fromCurrency} = ${formatValue(rate, toCurrency)} ${toCurrency}`,
        reverse: `1 ${toCurrency} = ${formatValue(1 / rate, fromCurrency)} ${fromCurrency}`,
      }
      : null;

  return (
    <div className="mt-4 space-y-6 animate-in fade-in duration-500">
      <h3 className="border-b border-slate-100 pb-4 text-2xl font-bold tracking-tight text-slate-800">
        {data.title}
      </h3>

      {/* Filters */}
      <div className="grid items-end gap-3 grid-cols-2 lg:grid-cols-7">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="col-span-2 w-full min-w-0 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:outline-none lg:col-span-2"
        >
          {categories.length === 0 && <option>Loading...</option>}
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select className="w-full min-w-0 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:outline-none lg:col-span-1">
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>

        <div className="flex flex-col gap-1 lg:col-span-1">
          <span className="text-xs font-medium text-slate-600">
            {data.filters.start}
          </span>
          <input
            type="date"
            className="w-full min-w-0 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none"
          />
        </div>

        {/* End date — full-width on mobile so buttons land on their own row */}
        <div className="col-span-2 flex flex-col gap-1 lg:col-span-1">
          <span className="text-xs font-medium text-slate-600">
            {data.filters.end}
          </span>
          <input
            type="date"
            className="w-full min-w-0 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none"
          />
        </div>

        {/* Buttons — col-span-2 on mobile → always side-by-side via flex */}
        <div className="col-span-2 flex gap-2 lg:col-span-2">
          <Button
            variant="primary"
            className="flex-1 bg-blue-700 px-4 py-2 text-sm font-semibold hover:bg-blue-800"
          >
            {data.filters.filterBtn}
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-blue-700 px-4 py-2 text-sm font-semibold hover:bg-blue-800"
          >
            {data.filters.downloadBtn}
          </Button>
        </div>
      </div>

      {/* ── MOBILE: card list (<md) ─────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {loadingHistory && (
          <div className="py-8 text-center text-slate-400 text-sm">
            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            {locale === "id" ? "Memuat data historis..." : "Loading history data..."}
          </div>
        )}
        {!loadingHistory && historyError && (
          <div className="py-8 text-center text-rose-400 text-sm">{historyError}</div>
        )}
        {!loadingHistory && !historyError && rows.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-sm">
            {locale === "id" ? "Tidak ada data yang tersedia." : "No data available."}
          </div>
        )}
        {rows.map((row, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-4 ${row.isBankHoliday
              ? "border-amber-200 bg-amber-50/40"
              : "border-slate-200 bg-white"
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-800">{row.d}</span>
              {row.isBankHoliday && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 uppercase tracking-wider">
                  {locale === "id" ? "Libur Bank" : "Bank Holiday"}
                </span>
              )}
            </div>
            {row.isBankHoliday ? (
              <p className="text-xs text-slate-500 capitalize">{row.description || (locale === "id" ? "Libur Bank" : "Bank Holiday")}</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {[
                  { label: data.columns[1], value: row.o },
                  { label: data.columns[2], value: row.h },
                  { label: data.columns[3], value: row.l },
                  { label: data.columns[4], value: row.c },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wide">{label}</span>
                    <span className="font-bold text-slate-800 tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── DESKTOP: table (≥md) ──────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-sm border border-slate-200">
        <table className="w-full border-separate border-spacing-0 text-left text-sm [&_td+td]:border-l [&_td+td]:border-slate-100 [&_th+th]:border-l [&_th+th]:border-slate-200">
          <thead className="border-b border-slate-300 bg-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-800">{data.columns[0]}</th>
              <th className="px-4 py-3 font-bold text-slate-800">{data.columns[1]}</th>
              <th className="px-4 py-3 font-bold text-slate-800">{data.columns[2]}</th>
              <th className="px-4 py-3 font-bold text-slate-800">{data.columns[3]}</th>
              <th className="px-4 py-3 font-bold text-slate-800">{data.columns[4]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {loadingHistory && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                  {locale === "id" ? "Memuat data historis..." : "Loading history data..."}
                </td>
              </tr>
            )}
            {!loadingHistory && historyError && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                  {historyError}
                </td>
              </tr>
            )}
            {!loadingHistory && !historyError && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                  {locale === "id" ? "Tidak ada data yang tersedia." : "No data available."}
                </td>
              </tr>
            )}
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={`transition-colors odd:bg-white even:bg-slate-50/70 hover:bg-slate-100/70 ${row.isBankHoliday ? "text-slate-500" : ""
                  }`}
              >
                {row.isBankHoliday ? (
                  <>
                    <td className="px-4 py-3.5 font-medium">{row.d}</td>
                    <td
                      colSpan={4}
                      className="px-4 py-3.5 text-sm font-medium text-slate-600 text-center capitalize"
                    >
                      {row.description || (locale === "id" ? "Libur Bank" : "Bank Holiday")}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3.5 font-medium">{row.d}</td>
                    <td className="px-4 py-3.5 tabular-nums">{row.o}</td>
                    <td className="px-4 py-3.5 tabular-nums">{row.h}</td>
                    <td className="px-4 py-3.5 tabular-nums">{row.l}</td>
                    <td className="px-4 py-3.5 tabular-nums">{row.c}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="py-2"
      />

      {/* Currency Converter */}
      <CurrencyConverter
        currencyPlaceholder={data.currencyValue}
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
        onFromCurrencyChange={setFromCurrency}
        onToCurrencyChange={setToCurrency}
        onFromValueChange={(value) => {
          setLastEdited("from");
          setFromValue(value);
          setToValue(recalcValue(value, fromCurrency, toCurrency));
        }}
        onToValueChange={(value) => {
          setLastEdited("to");
          setToValue(value);
          setFromValue(recalcValue(value, toCurrency, fromCurrency));
        }}
      />
    </div>
  );
}
