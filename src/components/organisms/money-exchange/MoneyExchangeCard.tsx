"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/atoms/Card";
import type { Locale } from "@/locales";
import { SectionHeader } from "@/components/molecules/SectionHeader";

type CurrencyOption = { code: string; name: string };

const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const parseAmount = (value: string) => {
  const cleaned = value.replace(/,/g, ".").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
};

const toPlainNumber = (value: number) =>
  value
    .toFixed(6)
    .replace(/\.?0+$/g, "")
    .replace(/^\.$/, "0");

export function MoneyExchangeCard({ locale }: { locale: Locale }) {
  const t = useMemo(() => {
    if (locale === "en") {
      return {
        kicker: "Currency",
        title: "Converter",
        from: "From",
        to: "To",
        value: "Currency value",
        liveRate: "Live rate",
        rateDate: "Rate date",
        error: "Failed to fetch exchange rate.",
      };
    }
    return {
      kicker: "Currency",
      title: "Converter",
      from: "Dari",
      to: "Ke",
      value: "Currency value",
      liveRate: "Live rate",
      rateDate: "Rate date",
      error: "Gagal mengambil kurs.",
    };
  }, [locale]);

  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [isCurrenciesLoading, setIsCurrenciesLoading] = useState(false);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("IDR");
  const [leftValue, setLeftValue] = useState("1");
  const [rightValue, setRightValue] = useState("");
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rateFromTo, setRateFromTo] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsCurrenciesLoading(true);
      try {
        const response = await fetch("/api/fx/currencies", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as {
          currencies?: CurrencyOption[];
        } | null;
        const list = Array.isArray(payload?.currencies)
          ? payload!.currencies
          : [];
        if (!cancelled) setCurrencies(list);
      } finally {
        if (!cancelled) setIsCurrenciesLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = currencies.length
    ? currencies
    : [
        { code: "USD", name: "US Dollar" },
        { code: "IDR", name: "Indonesian Rupiah" },
        { code: "EUR", name: "Euro" },
        { code: "GBP", name: "British Pound" },
        { code: "JPY", name: "Japanese Yen" },
      ];

  useEffect(() => {
    const amount =
      activeSide === "left" ? parseAmount(leftValue) : parseAmount(rightValue);

    setError(null);
    if (amount === null) {
      if (activeSide === "left") setRightValue("");
      else setLeftValue("");
      setRateFromTo(null);
      setRateDate(null);
      return;
    }

    const reqFrom = (activeSide === "left" ? from : to).trim().toUpperCase();
    const reqTo = (activeSide === "left" ? to : from).trim().toUpperCase();

    const id = ++requestIdRef.current;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        if (reqFrom === reqTo) {
          if (id !== requestIdRef.current) return;
          const value = toPlainNumber(amount);
          if (activeSide === "left") setRightValue(value);
          else setLeftValue(value);
          return;
        }

        const params = new URLSearchParams({
          from: reqFrom,
          to: reqTo,
          amount: String(amount),
        });

        const response = await fetch(`/api/fx?${params.toString()}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        const payload = (await response.json().catch(() => null)) as {
          result?: number;
          rate?: number;
          date?: string | null;
          error?: string;
        } | null;

        if (id !== requestIdRef.current) return;

        if (
          !response.ok ||
          !payload ||
          typeof payload.result !== "number" ||
          typeof payload.rate !== "number" ||
          !Number.isFinite(payload.rate)
        ) {
          setError(payload?.error || t.error);
          if (activeSide === "left") setRightValue("");
          else setLeftValue("");
          setRateFromTo(null);
          setRateDate(null);
          return;
        }

        const next = toPlainNumber(payload.result);
        if (activeSide === "left") setRightValue(next);
        else setLeftValue(next);

        const nextRate =
          activeSide === "left"
            ? payload.rate
            : payload.rate === 0
              ? null
              : 1 / payload.rate;
        setRateFromTo(nextRate && Number.isFinite(nextRate) ? nextRate : null);
        setRateDate(payload.date ?? null);
      } finally {
        if (id === requestIdRef.current) setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [activeSide, from, leftValue, rightValue, t.error, to]);

  return (
    <Card className="overflow-hidden">
      <SectionHeader
        title="Currency Converter"
        actions={
          <div
            className={classNames(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold animate-pulse",
              isLoading
                ? "border-red-200 bg-emerald-50 text-red-700"
                : "border-red-200 bg-white text-red-700",
            )}
          >
            <div className="flex items-center gap-1">
              <i className="fa-regular fa-circle-dot"></i>
              <span>{t.liveRate}</span>
            </div>
          </div>
        }
      />
      <div className="p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-200/40">
            <p className="text-xs font-bold text-slate-600">{t.from}</p>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2">
              <select
                aria-label={t.from}
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300"
                disabled={isCurrenciesLoading}
              >
                {options.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.code}
                  </option>
                ))}
              </select>
              <input
                aria-label={t.value}
                value={leftValue}
                onFocus={() => setActiveSide("left")}
                onChange={(event) => setLeftValue(event.target.value)}
                inputMode="decimal"
                placeholder="1"
                className={classNames(
                  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300",
                  isLoading && activeSide === "left" && "opacity-70",
                )}
              />
            </div>
          </div>

          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600 shadow-sm">
            =
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-200/40">
            <p className="text-xs font-bold text-slate-600">{t.to}</p>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2">
              <select
                aria-label={t.to}
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300"
                disabled={isCurrenciesLoading}
              >
                {options.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.code}
                  </option>
                ))}
              </select>
              <input
                aria-label={t.value}
                value={rightValue}
                onFocus={() => setActiveSide("right")}
                onChange={(event) => setRightValue(event.target.value)}
                inputMode="decimal"
                placeholder={t.value}
                className={classNames(
                  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300",
                  isLoading && activeSide === "right" && "opacity-70",
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          {error ? (
            <p className="text-xs font-semibold text-rose-700">{error}</p>
          ) : (
            <span className="text-xs font-semibold text-slate-500">
              {t.value}:{" "}
              {activeSide === "left" ? leftValue || "-" : rightValue || "-"}
            </span>
          )}

          <div className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-sm">
            <div className="font-bold text-slate-900">
              {rateFromTo === null
                ? `1 ${from} = - ${to}`
                : `1 ${from} = ${toPlainNumber(rateFromTo)} ${to}`}
            </div>
            <div className="mt-1 text-slate-600">
              {rateFromTo === null || rateFromTo === 0
                ? `1 ${to} = - ${from}`
                : `1 ${to} = ${toPlainNumber(1 / rateFromTo)} ${from}`}
            </div>
            <div className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              {t.rateDate} {rateDate ?? "-"}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
