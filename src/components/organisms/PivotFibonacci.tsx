"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Messages } from "@/locales";
import { Button } from "../atoms/Button";
import { CurrencyConverter } from "../molecules/CurrencyConverter";
import { Pagination } from "../molecules/Pagination";

type PivotFibonacciProps = {
  messages: Messages;
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

export function PivotFibonacci({ messages }: PivotFibonacciProps) {
  const pfData = messages.policy.pivotFibonacci;
  const historicData = messages.policy.historicData;
  const [subTab, setSubTab] = useState<"pivot" | "fibonacci">("pivot");

  // --- State: Pivot ---
  const [pivotInputs, setPivotInputs] = useState({
    open: "",
    high: "",
    low: "",
    close: "",
  });
  const [pivotResults, setPivotResults] = useState({
    classic: { r4: 0, r3: 0, r2: 0, r1: 0, p: 0, s1: 0, s2: 0, s3: 0, s4: 0 },
    woodie: { r4: 0, r3: 0, r2: 0, r1: 0, p: 0, s1: 0, s2: 0, s3: 0, s4: 0 },
    camarilla: { r4: 0, r3: 0, r2: 0, r1: 0, p: 0, s1: 0, s2: 0, s3: 0, s4: 0 },
  });

  const calculatePivot = () => {
    const o = parseFloat(pivotInputs.open) || 0;
    const h = parseFloat(pivotInputs.high) || 0;
    const l = parseFloat(pivotInputs.low) || 0;
    const c = parseFloat(pivotInputs.close) || 0;
    if (h === 0 && l === 0 && c === 0) return;

    const range = h - l;

    // Classic
    const cp = (h + l + c) / 3;
    const cr1 = 2 * cp - l;
    const cs1 = 2 * cp - h;
    const cr2 = cp + range;
    const cs2 = cp - range;
    const cr3 = h + 2 * (cp - l);
    const cs3 = l - 2 * (h - cp);
    const cr4 = cr3 + range;
    const cs4 = cs3 - range;

    // Woodie
    const wp = (h + l + 2 * c) / 4;
    const wr1 = 2 * wp - l;
    const ws1 = 2 * wp - h;
    const wr2 = wp + range;
    const ws2 = wp - range;
    const wr3 = h + 2 * (wp - l);
    const ws3 = l - 2 * (h - wp);
    const wr4 = wr3 + range;
    const ws4 = ws3 - range;

    // Camarilla
    const camP = (h + l + c) / 3;
    const camR4 = c + (range * 1.1) / 2;
    const camR3 = c + (range * 1.1) / 4;
    const camR2 = c + (range * 1.1) / 6;
    const camR1 = c + (range * 1.1) / 12;
    const camS1 = c - (range * 1.1) / 12;
    const camS2 = c - (range * 1.1) / 6;
    const camS3 = c - (range * 1.1) / 4;
    const camS4 = c - (range * 1.1) / 2;

    setPivotResults({
      classic: {
        r4: cr4,
        r3: cr3,
        r2: cr2,
        r1: cr1,
        p: cp,
        s1: cs1,
        s2: cs2,
        s3: cs3,
        s4: cs4,
      },
      woodie: {
        r4: wr4,
        r3: wr3,
        r2: wr2,
        r1: wr1,
        p: wp,
        s1: ws1,
        s2: ws2,
        s3: ws3,
        s4: ws4,
      },
      camarilla: {
        r4: camR4,
        r3: camR3,
        r2: camR2,
        r1: camR1,
        p: camP,
        s1: camS1,
        s2: camS2,
        s3: camS3,
        s4: camS4,
      },
    });
  };

  // --- State: Fibo Up ---
  const [fiboUpInputs, setFiboUpInputs] = useState({ low: "", high: "" });
  const [fiboUpResults, setFiboUpResults] = useState({
    retracement: {
      "23.60%": 0,
      "38.20%": 0,
      "50.0%": 0,
      "61.80%": 0,
      "78.60%": 0,
    },
    projection: {
      "138.20%": 0,
      "150.00%": 0,
      "161.80%": 0,
      "200.00%": 0,
      "238.20%": 0,
      "261.80%": 0,
    },
  });

  const calculateFiboUp = () => {
    const l = parseFloat(fiboUpInputs.low) || 0;
    const h = parseFloat(fiboUpInputs.high) || 0;
    if (l === 0 && h === 0) return;
    const diff = h - l;

    setFiboUpResults({
      retracement: {
        "23.60%": h - 0.236 * diff,
        "38.20%": h - 0.382 * diff,
        "50.0%": h - 0.5 * diff,
        "61.80%": h - 0.618 * diff,
        "78.60%": h - 0.786 * diff,
      },
      projection: {
        "138.20%": h + 0.382 * diff,
        "150.00%": h + 0.5 * diff,
        "161.80%": h + 0.618 * diff,
        "200.00%": h + 1.0 * diff,
        "238.20%": h + 1.382 * diff,
        "261.80%": h + 1.618 * diff,
      },
    });
  };

  // --- State: Fibo Down ---
  const [fiboDownInputs, setFiboDownInputs] = useState({ high: "", low: "" });
  const [fiboDownResults, setFiboDownResults] = useState({
    retracement: {
      "78.60%": 0,
      "61.80%": 0,
      "50.0%": 0,
      "38.20%": 0,
      "23.60%": 0,
    },
    projection: {
      "138.20%": 0,
      "150.00%": 0,
      "161.80%": 0,
      "200.00%": 0,
      "238.20%": 0,
      "261.80%": 0,
    },
  });

  const calculateFiboDown = () => {
    const h = parseFloat(fiboDownInputs.high) || 0;
    const l = parseFloat(fiboDownInputs.low) || 0;
    if (h === 0 && l === 0) return;
    const diff = h - l;

    setFiboDownResults({
      retracement: {
        "78.60%": l + 0.786 * diff,
        "61.80%": l + 0.618 * diff,
        "50.0%": l + 0.5 * diff,
        "38.20%": l + 0.382 * diff,
        "23.60%": l + 0.236 * diff,
      },
      projection: {
        "138.20%": l - 0.382 * diff,
        "150.00%": l - 0.5 * diff,
        "161.80%": l - 0.618 * diff,
        "200.00%": l - 1.0 * diff,
        "238.20%": l - 1.382 * diff,
        "261.80%": l - 1.618 * diff,
      },
    });
  };

  const formatNum = (num: number) => {
    if (num === 0) return "0";
    return num.toFixed(3);
  };

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
  const [selectedCategory, setSelectedCategory] = useState<string>("LGD Daily");
  const [page, setPage] = useState(1);
  const perPage = 5;

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
    const locale = currency === "IDR" ? "id-ID" : "en-US";

    return new Intl.NumberFormat(locale, {
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

  useEffect(() => {
    let isActive = true;

    const fetchCurrencies = async () => {
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
    <div className="mt-8 animate-in fade-in duration-500">
      {/* Sub Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-6">
        <button
          onClick={() => setSubTab("pivot")}
          className={`px-4 py-3 text-sm font-semibold transition-all relative ${
            subTab === "pivot"
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
          className={`px-4 py-3 text-sm font-semibold transition-all relative ${
            subTab === "fibonacci"
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
      {subTab === "pivot" && (
        <div className="space-y-8">
          {/* Inputs */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[120px]">
              <label className="sr-only">{pfData.inputs.open}</label>
              <input
                type="number"
                placeholder={pfData.inputs.open}
                value={pivotInputs.open}
                onChange={(e) =>
                  setPivotInputs({ ...pivotInputs, open: e.target.value })
                }
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="sr-only">{pfData.inputs.high}</label>
              <input
                type="number"
                placeholder={pfData.inputs.high}
                value={pivotInputs.high}
                onChange={(e) =>
                  setPivotInputs({ ...pivotInputs, high: e.target.value })
                }
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="sr-only">{pfData.inputs.low}</label>
              <input
                type="number"
                placeholder={pfData.inputs.low}
                value={pivotInputs.low}
                onChange={(e) =>
                  setPivotInputs({ ...pivotInputs, low: e.target.value })
                }
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="sr-only">{pfData.inputs.close}</label>
              <input
                type="number"
                placeholder={pfData.inputs.close}
                value={pivotInputs.close}
                onChange={(e) =>
                  setPivotInputs({ ...pivotInputs, close: e.target.value })
                }
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <div className="col-span-2 md:col-span-1 md:w-auto">
              <Button
                onClick={calculatePivot}
                variant="primary"
                className="w-full md:w-auto font-medium py-2 px-6"
              >
                {pfData.inputs.calculate}
              </Button>
            </div>
          </div>

          {/* Pivot Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-3 px-4 font-bold w-32"></th>
                  <th className="py-3 px-4 font-bold">
                    {pfData.pivot.columns[0]}
                  </th>
                  <th className="py-3 px-4 font-bold">
                    {pfData.pivot.columns[1]}
                  </th>
                  <th className="py-3 px-4 font-bold">
                    {pfData.pivot.columns[2]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    k: "R4",
                    c: pivotResults.classic.r4,
                    w: pivotResults.woodie.r4,
                    cam: pivotResults.camarilla.r4,
                  },
                  {
                    k: "R3",
                    c: pivotResults.classic.r3,
                    w: pivotResults.woodie.r3,
                    cam: pivotResults.camarilla.r3,
                  },
                  {
                    k: "R2",
                    c: pivotResults.classic.r2,
                    w: pivotResults.woodie.r2,
                    cam: pivotResults.camarilla.r2,
                  },
                  {
                    k: "R1",
                    c: pivotResults.classic.r1,
                    w: pivotResults.woodie.r1,
                    cam: pivotResults.camarilla.r1,
                  },
                  {
                    k: "Pivot",
                    c: pivotResults.classic.p,
                    w: pivotResults.woodie.p,
                    cam: pivotResults.camarilla.p,
                  },
                  {
                    k: "S1",
                    c: pivotResults.classic.s1,
                    w: pivotResults.woodie.s1,
                    cam: pivotResults.camarilla.s1,
                  },
                  {
                    k: "S2",
                    c: pivotResults.classic.s2,
                    w: pivotResults.woodie.s2,
                    cam: pivotResults.camarilla.s2,
                  },
                  {
                    k: "S3",
                    c: pivotResults.classic.s3,
                    w: pivotResults.woodie.s3,
                    cam: pivotResults.camarilla.s3,
                  },
                  {
                    k: "S4",
                    c: pivotResults.classic.s4,
                    w: pivotResults.woodie.s4,
                    cam: pivotResults.camarilla.s4,
                  },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {row.k}
                    </td>
                    <td className="py-3 px-4 font-bold">{formatNum(row.c)}</td>
                    <td className="py-3 px-4 font-bold">{formatNum(row.w)}</td>
                    <td className="py-3 px-4 font-bold text-slate-600">
                      {formatNum(row.cam)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fibonacci Tab Content */}
      {subTab === "fibonacci" && (
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Up Trend Box */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-6">
              {/* Graphic Placeholder */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-md flex-1 flex flex-col items-center justify-center min-h-[220px]">
                <h4 className="text-emerald-500 font-extrabold text-xl tracking-tighter mb-4 flex items-center gap-1">
                  {pfData.fibonacci.upTrend}
                  <div className="flex -space-x-1">
                    <i className="fa-solid fa-arrow-up text-emerald-500 text-lg"></i>
                    <i className="fa-solid fa-arrow-up text-emerald-500 text-lg"></i>
                    <i className="fa-solid fa-arrow-up text-emerald-500 text-lg"></i>
                  </div>
                </h4>
                <div className="relative w-32 h-24 border-l-2 border-b-2 border-slate-300">
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute bottom-0 left-0 w-full h-full overflow-visible"
                  >
                    <polyline
                      points="0,100 20,60 40,80 70,20 100,0"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="0" cy="100" r="4" fill="#3b82f6" />
                    <circle cx="100" cy="0" r="4" fill="#3b82f6" />
                    <text
                      x="-5"
                      y="115"
                      fontSize="10"
                      fill="#64748b"
                      fontWeight="bold"
                    >
                      A
                    </text>
                    <text
                      x="105"
                      y="-5"
                      fontSize="10"
                      fill="#64748b"
                      fontWeight="bold"
                    >
                      C
                    </text>
                  </svg>
                </div>
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-4 min-w-[180px] w-full sm:w-auto">
                <div className="space-y-1">
                  <label className="text-sm text-slate-600 ml-1">
                    {pfData.fibonacci.priceA}
                  </label>
                  <input
                    type="number"
                    placeholder={pfData.fibonacci.lowValue}
                    value={fiboUpInputs.low}
                    onChange={(e) =>
                      setFiboUpInputs({ ...fiboUpInputs, low: e.target.value })
                    }
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600 ml-1">
                    {pfData.fibonacci.priceB}
                  </label>
                  <input
                    type="number"
                    placeholder={pfData.fibonacci.highValue}
                    value={fiboUpInputs.high}
                    onChange={(e) =>
                      setFiboUpInputs({ ...fiboUpInputs, high: e.target.value })
                    }
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </div>
                <Button
                  onClick={calculateFiboUp}
                  variant="primary"
                  className="mt-auto py-2.5 px-6 font-medium"
                >
                  {pfData.inputs.calculate}
                </Button>
              </div>
            </div>

            {/* Fibonacci UP Tables */}
            <div className="grid grid-cols-2 gap-6">
              <table className="w-full text-left text-sm border border-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th
                      colSpan={2}
                      className="py-2.5 px-3 tracking-tight text-slate-800"
                    >
                      {pfData.fibonacci.retracement}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    Object.keys(fiboUpResults.retracement) as Array<
                      keyof typeof fiboUpResults.retracement
                    >
                  ).map((pct, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                      <td className="py-2.5 px-3 text-right">
                        {formatNum(fiboUpResults.retracement[pct])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full text-left text-sm border border-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th
                      colSpan={2}
                      className="py-2.5 px-3 tracking-tight text-slate-800"
                    >
                      {pfData.fibonacci.projection}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    Object.keys(fiboUpResults.projection) as Array<
                      keyof typeof fiboUpResults.projection
                    >
                  ).map((pct, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                      <td className="py-2.5 px-3 text-right">
                        {formatNum(fiboUpResults.projection[pct])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="hidden lg:block border-l border-slate-200 mx-auto w-px h-full absolute left-1/2 -ml-0.5"></div>

          {/* Down Trend Box */}
          <div className="space-y-6 lg:pl-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-6">
              {/* Graphic Placeholder */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-md flex-1 flex flex-col items-center justify-center min-h-[220px]">
                <h4 className="text-red-600 font-extrabold text-xl tracking-tighter mb-4 flex items-center gap-1">
                  {pfData.fibonacci.downTrend}
                  <div className="flex -space-x-1">
                    <i className="fa-solid fa-arrow-down text-red-600 text-lg"></i>
                    <i className="fa-solid fa-arrow-down text-red-600 text-lg"></i>
                    <i className="fa-solid fa-arrow-down text-red-600 text-lg"></i>
                  </div>
                </h4>
                <div className="relative w-32 h-24 border-l-2 border-b-2 border-slate-300">
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute bottom-0 left-0 w-full h-full overflow-visible"
                  >
                    <polyline
                      points="0,0 20,40 40,20 70,80 100,100"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="0" cy="0" r="4" fill="#3b82f6" />
                    <circle cx="100" cy="100" r="4" fill="#3b82f6" />
                    <text
                      x="-5"
                      y="-5"
                      fontSize="10"
                      fill="#64748b"
                      fontWeight="bold"
                    >
                      A
                    </text>
                    <text
                      x="105"
                      y="115"
                      fontSize="10"
                      fill="#64748b"
                      fontWeight="bold"
                    >
                      C
                    </text>
                  </svg>
                </div>
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-4 min-w-[180px] w-full sm:w-auto">
                <div className="space-y-1">
                  <label className="text-sm text-slate-600 ml-1">
                    {pfData.fibonacci.priceA}
                  </label>
                  <input
                    type="number"
                    placeholder={pfData.fibonacci.highValue}
                    value={fiboDownInputs.high}
                    onChange={(e) =>
                      setFiboDownInputs({
                        ...fiboDownInputs,
                        high: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600 ml-1">
                    {pfData.fibonacci.priceB}
                  </label>
                  <input
                    type="number"
                    placeholder={pfData.fibonacci.lowValue}
                    value={fiboDownInputs.low}
                    onChange={(e) =>
                      setFiboDownInputs({
                        ...fiboDownInputs,
                        low: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </div>
                <Button
                  onClick={calculateFiboDown}
                  variant="primary"
                  className="mt-auto py-2.5 px-6 font-medium"
                >
                  {pfData.inputs.calculate}
                </Button>
              </div>
            </div>

            {/* Fibonacci DOWN Tables */}
            <div className="grid grid-cols-2 gap-6">
              <table className="w-full text-left text-sm border border-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th
                      colSpan={2}
                      className="py-2.5 px-3 tracking-tight text-slate-800"
                    >
                      {pfData.fibonacci.retracement}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    Object.keys(fiboDownResults.retracement) as Array<
                      keyof typeof fiboDownResults.retracement
                    >
                  ).map((pct, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                      <td className="py-2.5 px-3 text-right">
                        {formatNum(fiboDownResults.retracement[pct])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full text-left text-sm border border-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th
                      colSpan={2}
                      className="py-2.5 px-3 tracking-tight text-slate-800"
                    >
                      {pfData.fibonacci.projection}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    Object.keys(fiboDownResults.projection) as Array<
                      keyof typeof fiboDownResults.projection
                    >
                  ).map((pct, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                      <td className="py-2.5 px-3 text-right">
                        {formatNum(fiboDownResults.projection[pct])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Historical Table and Converter Block (Appears for both modes) */}
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

        {/* Currency Converter */}
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

    </div>
  );
}
