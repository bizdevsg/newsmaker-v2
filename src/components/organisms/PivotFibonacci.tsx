"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Messages } from "@/locales";
import { useLoading } from "../providers/LoadingProvider";
import { PivotFibonacciPivotTab } from "./PivotFibonacciPivotTab";
import { PivotFibonacciFibonacciTab } from "./PivotFibonacciFibonacciTab";
import { PivotFibonacciHistory } from "./PivotFibonacciHistory";

type PivotFibonacciProps = {
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

export function PivotFibonacci({ messages, locale }: PivotFibonacciProps) {
  const loading = useLoading();
  const pfData = messages.policy.pivotFibonacci;
  const [subTab, setSubTab] = useState<"pivot" | "fibonacci">("pivot");
  const initialCurrenciesLoad = useRef(true);
  const initialRateLoad = useRef(true);
  const initialHistoryLoad = useRef(true);

  // --- State: Currency Converter ---
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

  // --- State: Pivot History ---
  const [historyRows, setHistoryRows] = useState<PivotHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

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
        normalized = normalized.replace(/\./g, "").replace(",", ".");
      } else {
        normalized = normalized.replace(/,/g, "");
      }
    } else if (hasComma) {
      const commaParts = normalized.split(",");

      if (commaParts.length === 2 && commaParts[1].length === 3) {
        normalized = normalized.replace(/,/g, "");
      } else {
        normalized = normalized.replace(",", ".");
      }
    } else if (hasDot) {
      const dotParts = normalized.split(".");

      if (dotParts.length === 2 && dotParts[1].length === 3) {
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
    const localeStr = locale === "id" ? "id-ID" : "en-US";
    return new Intl.NumberFormat(localeStr, {
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(value);
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
        ? loading.start("pivot-currencies")
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

    const fetchRate = async () => {
      const token = initialRateLoad.current
        ? loading.start("pivot-rate")
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
    let isActive = true;

    const fetchHistory = async () => {
      const token = initialHistoryLoad.current
        ? loading.start("pivot-history")
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
            setHistoryError("Failed to load history data.");
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
          setHistoryError("Failed to load history data.");
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
    if (lastEdited === "from") {
      setToValue(recalcValue(fromValue, fromCurrency, toCurrency));
    } else {
      setFromValue(recalcValue(toValue, toCurrency, fromCurrency));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency, rate]);

  const rateText =
    rate && rate > 0
      ? {
        forward: `1 ${fromCurrency} = ${formatValue(rate, toCurrency)} ${toCurrency}`,
        reverse: `1 ${toCurrency} = ${formatValue(1 / rate, fromCurrency)} ${fromCurrency}`,
      }
      : null;

  return (
    <div className="mt-8 animate-in fade-in duration-500">
      {/* Sub Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-6">
        <button
          onClick={() => setSubTab("pivot")}
          className={`px-4 py-3 text-sm font-semibold transition-all relative ${subTab === "pivot"
              ? "text-blue-700 bg-white"
              : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
            }`}
        >
          {pfData.tabs.pivot}
          {subTab === "pivot" && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-700"></div>
          )}
          {subTab === "pivot" && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-white"></div>
          )}
        </button>
        <button
          onClick={() => setSubTab("fibonacci")}
          className={`px-4 py-3 text-sm font-semibold transition-all relative ${subTab === "fibonacci"
              ? "text-blue-700 bg-white"
              : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
            }`}
        >
          {pfData.tabs.fibonacci}
          {subTab === "fibonacci" && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-700"></div>
          )}
          {subTab === "fibonacci" && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-white"></div>
          )}
        </button>
        <div className="flex-1 bg-slate-50 border-t border-r border-slate-200 self-stretch rounded-tr-md"></div>
      </div>

      {/* Pivot Tab Content */}
      {subTab === "pivot" && <PivotFibonacciPivotTab messages={messages} />}

      {/* Fibonacci Tab Content */}
      {subTab === "fibonacci" && (
        <PivotFibonacciFibonacciTab messages={messages} />
      )}

      <PivotFibonacciHistory
        messages={messages}
        historyRows={historyRows}
        loadingHistory={loadingHistory}
        historyError={historyError}
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
