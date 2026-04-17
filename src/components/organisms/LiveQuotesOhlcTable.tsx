"use client";

import React from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import type { Locale, Messages } from "@/locales";

type LiveQuotesOhlcTableProps = {
  messages: Messages;
  locale?: Locale;
  limit?: number;
  pollIntervalMs?: number;
};

type LiveQuoteRow = {
  symbol?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  price?: number;
  valueChange?: number;
  percentChange?: number;
  serverTime?: string;
  serverDateTime?: string;
  time?: string;
  date_time?: string;
};

type LiveQuotesResponse = {
  status?: string;
  updatedAt?: string;
  serverTime?: string;
  total?: number;
  data?: LiveQuoteRow[];
  source?: string;
  state?: string;
  error?: unknown;
};

const LIVE_QUOTES_URL = "/api/live-quotes";

const normalizeSymbol = (value?: string) => value?.trim().toUpperCase() ?? "";

const SYMBOL_LABELS = new Map<string, string>([
  ["^JKSE", "IHSG"],
  ["^JKLQ45", "LQ45"],
  ["XUL10", "Gold"],
  ["XAUUSD", "Gold"],
  ["XAGUSD", "Silver"],
  ["BCO10_BBJ", "Brent"],
  ["UKOIL", "Brent"],
  ["HKK50_BBJ", "Hang Seng"],
  ["HSI", "Hang Seng"],
  ["JPK50_BBJ", "Nikkei"],
  ["NIKKEI", "Nikkei"],
  ["EU10F_BBJ", "EUR/USD"],
  ["UJ10F_BBJ", "USD/JPY"],
  ["UC10F_BBJ", "USD/CHF"],
  ["AU10F_BBJ", "AUD/USD"],
  ["GU10F_BBJ", "GBP/USD"],
]);

const CANONICAL_SYMBOLS = new Map<string, string>([
  ["XUL10", "XAUUSD"],
  ["XAUUSD", "XAUUSD"],
  ["XAGUSD", "XAGUSD"],
  ["BCO10_BBJ", "BCOUSD"],
  ["UKOIL", "UKOIL"],
  ["HKK50_BBJ", "HSI"],
  ["HSI", "HSI"],
  ["JPK50_BBJ", "Nikkei 255"],
  ["NIKKEI", "NIKKEI"],
  ["EU10F_BBJ", "EURUSD"],
  ["UJ10F_BBJ", "USDJPY"],
  ["UC10F_BBJ", "USDCHF"],
  ["AU10F_BBJ", "AUDUSD"],
  ["GU10F_BBJ", "GBPUSD"],
]);

const formatNumber = (value: number, locale?: Locale) => {
  const normalizedLocale = locale === "en" ? "en-US" : "id-ID";
  return new Intl.NumberFormat(normalizedLocale, {
    maximumFractionDigits: 4,
  }).format(value);
};

const formatSignedPercent = (value: number, locale?: Locale) => {
  const normalizedLocale = locale === "en" ? "en-US" : "id-ID";
  const sign = value > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat(normalizedLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;
};

const getNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const pickOhlc = (row: LiveQuoteRow) => {
  // Be defensive: upstream schemas can differ.
  const anyRow = row as Record<string, unknown>;
  const open = getNumber(
    row.open ?? anyRow.o ?? anyRow.open_price ?? anyRow.dayOpen,
  );
  const high = getNumber(
    row.high ?? anyRow.h ?? anyRow.high_price ?? anyRow.dayHigh,
  );
  const low = getNumber(
    row.low ?? anyRow.l ?? anyRow.low_price ?? anyRow.dayLow,
  );
  const close = getNumber(
    row.close ??
      anyRow.c ??
      anyRow.close_price ??
      anyRow.prevClose ??
      anyRow.previousClose ??
      row.price,
  );

  return { open, high, low, close };
};

const resolveChangePercent = (
  row: LiveQuoteRow,
  open?: number,
  close?: number,
) => {
  if (
    typeof row.percentChange === "number" &&
    Number.isFinite(row.percentChange)
  ) {
    return row.percentChange;
  }

  if (
    typeof row.valueChange === "number" &&
    Number.isFinite(row.valueChange) &&
    typeof close === "number" &&
    Number.isFinite(close) &&
    close !== 0
  ) {
    return (row.valueChange / close) * 100;
  }

  if (
    typeof open === "number" &&
    Number.isFinite(open) &&
    typeof close === "number" &&
    Number.isFinite(close) &&
    open !== 0
  ) {
    return ((close - open) / open) * 100;
  }

  return undefined;
};

const resolveTone = (percent?: number) => {
  if (typeof percent !== "number" || !Number.isFinite(percent))
    return "unknown";
  if (percent > 0) return "up";
  if (percent < 0) return "down";
  return "flat";
};

const resolveLabel = (symbol?: string) => {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return "";
  return SYMBOL_LABELS.get(normalized) ?? normalized.replace(/^\^/, "");
};

const resolveCanonicalSymbol = (symbol?: string) => {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return "";
  return CANONICAL_SYMBOLS.get(normalized) ?? normalized.replace(/^\^/, "");
};

export function LiveQuotesOhlcTable({
  messages,
  locale,
  limit = 20,
  pollIntervalMs = 5_000,
}: LiveQuotesOhlcTableProps) {
  const [rows, setRows] = React.useState<LiveQuoteRow[]>([]);
  const [updatedAt, setUpdatedAt] = React.useState<string>("");

  React.useEffect(() => {
    let isActive = true;
    let intervalId: number | null = null;

    const load = async () => {
      try {
        const response = await fetch(LIVE_QUOTES_URL, { cache: "no-store" });
        if (!response.ok) return;
        const json = (await response
          .json()
          .catch(() => null)) as LiveQuotesResponse | null;
        const nextRows = Array.isArray(json?.data) ? json?.data : [];
        if (!isActive) return;
        setRows(nextRows);
        setUpdatedAt(String(json?.updatedAt ?? json?.serverTime ?? ""));
      } catch {
        // ignore
      }
    };

    void load();
    intervalId = window.setInterval(load, Math.max(1_000, pollIntervalMs));

    return () => {
      isActive = false;
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [pollIntervalMs]);

  const tableRows = React.useMemo(() => {
    const capped = rows.slice(0, Math.max(0, limit));
    return capped.map((row, index) => {
      const symbol = normalizeSymbol(row.symbol);
      const canonicalSymbol = resolveCanonicalSymbol(symbol);
      const label = resolveLabel(symbol);
      const ohlc = pickOhlc(row);
      const percentChange = resolveChangePercent(row, ohlc.open, ohlc.close);
      const tone = resolveTone(percentChange);

      return {
        key: `${symbol || "row"}-${index}`,
        symbol,
        canonicalSymbol: canonicalSymbol || symbol || "",
        label: label || "",
        displayFallback: `#${index + 1}`,
        open: ohlc.open,
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        percentChange,
        tone,
      };
    });
  }, [limit, rows]);

  const t = messages.policy.liveChart.ohlcQuotes;
  const subtitle = updatedAt?.trim()
    ? `${t.updatedLabel}: ${updatedAt.trim()}`
    : undefined;

  return (
    <Card className="overflow-hidden">
      <SectionHeader title={t.title} optional={subtitle} />
      <div className="p-4">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
              <tr className="[&>th]:px-4 [&>th]:py-3">
                <th>{t.columns.symbol}</th>
                <th>{t.columns.open}</th>
                <th>{t.columns.high}</th>
                <th>{t.columns.low}</th>
                <th>{t.columns.close}</th>
                <th className="text-right">{t.columns.change}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tableRows.length ? (
                tableRows.map((row) => {
                  const toneStyle =
                    row.tone === "up"
                      ? {
                          text: "text-emerald-700",
                          rowBg: "[&>td]:bg-emerald-50",
                        }
                      : row.tone === "down"
                        ? {
                            text: "text-rose-700",
                            rowBg: "[&>td]:bg-rose-50",
                          }
                        : row.tone === "flat"
                          ? {
                              text: "text-slate-700",
                              rowBg: "[&>td]:bg-slate-50",
                            }
                          : { text: "text-slate-400", rowBg: "" };

                  const cell = (value?: number) =>
                    typeof value === "number"
                      ? formatNumber(value, locale)
                      : "\u2014";

                  return (
                    <tr
                      key={row.key}
                      className={[
                        "[&>td]:px-4 [&>td]:py-3 [&>td]:transition-colors",
                        toneStyle.rowBg,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="font-semibold text-slate-900">
                        {row.label}
                        {row.label && row.label !== row.canonicalSymbol ? (
                          <span className="ml-2 text-xs font-medium text-slate-400">
                            {row.canonicalSymbol || row.displayFallback}
                          </span>
                        ) : null}
                      </td>
                      <td className="tabular-nums text-slate-700">
                        {cell(row.open)}
                      </td>
                      <td className="tabular-nums text-slate-700">
                        {cell(row.high)}
                      </td>
                      <td className="tabular-nums text-slate-700">
                        {cell(row.low)}
                      </td>
                      <td className="tabular-nums text-slate-700">
                        {cell(row.close)}
                      </td>
                      <td
                        className={[
                          "text-right tabular-nums font-semibold",
                          toneStyle.text,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {typeof row.percentChange === "number"
                          ? formatSignedPercent(row.percentChange, locale)
                          : "\u2014"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="[&>td]:px-4 [&>td]:py-6">
                  <td colSpan={6} className="text-center text-slate-500">
                    {t.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
