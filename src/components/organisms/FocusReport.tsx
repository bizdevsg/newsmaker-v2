"use client";

import React from "react";
import { Card } from "../atoms/Card";
import { Button } from "../atoms/Button";
import type { Messages } from "@/locales";
import type { LiveQuoteItem, LiveQuoteResponse } from "@/types/indonesiaMarket";
import { SectionHeader } from "../molecules/SectionHeader";

type FocusReportProps = {
  messages: Messages;
};

const LIVE_QUOTES_ENDPOINT = "/api/live-quotes";

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const parseNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const formatNumber = (value: number | undefined, digits = 0) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

const formatChangePoints = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, 2)}`;
};

const buildMetricFromQuote = (
  key: string,
  label: string,
  quote: LiveQuoteItem | undefined,
  fallback?: { value: string; delta: string; tone?: string; meta?: string },
  decimals?: number,
) => {
  const price = parseNumber(quote?.last ?? quote?.price);
  const absoluteChange = parseNumber(quote?.valueChange);
  const value = formatNumber(price, decimals ?? (price && price < 10 ? 4 : 2));
  const tone =
    absoluteChange !== undefined
      ? absoluteChange < 0
        ? "down"
        : absoluteChange > 0
          ? "up"
          : "flat"
      : "flat";
  const meta =
    formatChangePoints(absoluteChange) ??
    quote?.serverTime ??
    quote?.serverDateTime ??
    "";
  return {
    key,
    label,
    value: value ?? fallback?.value ?? "-",
    tone: (tone ?? fallback?.tone ?? "flat") as "up" | "down" | "flat",
    meta: meta || fallback?.meta || "",
  };
};

const preferredOrder = [
  "XUL10",
  "BCO10_BBJ",
  "AU10F_BBJ",
  "HKK50_BBJ",
  "JPK50_BBJ",
  "UJ10F_BBJ",
];

const displayMeta: Record<
  string,
  {
    label: string;
    subtitle: string;
    icon?: string;
    iconBg: string;
    imageSrc?: string;
    decimals: number;
  }
> = {
  XUL10: {
    label: "GOLD",
    subtitle: "XAUUSD",
    imageSrc: "/assets/goldIMG.png",
    iconBg: "bg-amber-100 text-amber-700",
    decimals: 2,
  },
  BCO10_BBJ: {
    label: "UKOIL",
    subtitle: "BCOUSD",
    imageSrc: "/assets/BCOimg.png",
    iconBg: "bg-slate-200 text-slate-700",
    decimals: 2,
  },
  AU10F_BBJ: {
    label: "SILVER",
    subtitle: "XAGUSD",
    imageSrc: "/assets/silverlogo.png",
    iconBg: "bg-slate-100 text-slate-700",
    decimals: 5,
  },
  HKK50_BBJ: {
    label: "HANGSENG",
    subtitle: "HSI",
    imageSrc: "/assets/HangSengLogo.png",
    iconBg: "bg-rose-100 text-rose-600",
    decimals: 2,
  },
  JPK50_BBJ: {
    label: "NIKKEI",
    subtitle: "NIKKEI 255",
    imageSrc: "/assets/NikkeiLogo.png",
    iconBg: "bg-blue-100 text-blue-700",
    decimals: 0,
  },
  UJ10F_BBJ: {
    label: "USD/JPY",
    subtitle: "UJ10F",
    icon: "fa-solid fa-dollar-sign",
    iconBg: "bg-emerald-100 text-emerald-700",
    decimals: 2,
  },
};

type DisplayMetric = {
  key: string;
  label: string;
  subtitle: string;
  icon: string;
  imageSrc?: string;
  value: string;
  tone: "up" | "down" | "flat";
  meta: string;
};

const buildMetrics = (quotes: LiveQuoteItem[]): DisplayMetric[] => {
  const quoteMap = new Map(quotes.map((item) => [item.symbol, item]));
  const ordered = preferredOrder
    .map((symbol) => quoteMap.get(symbol))
    .filter(Boolean) as LiveQuoteItem[];

  const remaining = quotes.filter(
    (item) => !preferredOrder.includes(item.symbol),
  );
  const selected = [...ordered, ...remaining].slice(0, 5);

  return selected.map((quote) => {
    const meta = displayMeta[quote.symbol] ?? {
      label: quote.symbol,
      subtitle: quote.symbol,
      icon: "fa-solid fa-chart-line",
      iconBg: "bg-slate-200 text-slate-700",
      decimals: 2,
    };
    return {
      ...buildMetricFromQuote(
        quote.symbol,
        meta.label,
        quote,
        undefined,
        meta.decimals,
      ),
      subtitle: meta.subtitle,
      icon: meta.icon ?? "fa-solid fa-chart-line",
      iconBg: meta.iconBg,
      imageSrc: meta.imageSrc,
    };
  });
};

export function FocusReport({ messages }: FocusReportProps) {
  const [metrics, setMetrics] = React.useState<DisplayMetric[]>([]);

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const liveQuotes =
        await fetchJson<LiveQuoteResponse>(LIVE_QUOTES_ENDPOINT);
      if (!isMounted) return;
      setMetrics(buildMetrics(liveQuotes?.data ?? []));
    };

    const initialTimer = window.setTimeout(load, 300);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load();
      }
    }, 60000);

    return () => {
      isMounted = false;
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);
  const heroImage = "/assets/tourism-guangzhou-rivers-city-river-cp.jpg";

  return (
    <Card as="section">
      <SectionHeader title={messages.focusReport.kicker} />
      <div className="space-y-4 px-6 pb-6 pt-4">
        <div className="relative overflow-hidden rounded-md">
          <img
            src={heroImage}
            alt={messages.focusReport.title}
            className="h-40 w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-blue-950/70 via-blue-900/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end gap-2 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              {messages.focusReport.kicker}
            </p>
            <h4 className="text-xl font-semibold leading-snug">
              {messages.focusReport.title}
            </h4>
            <p className="text-xs text-white/80">
              {messages.focusReport.subtitle}
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-2 w-fit rounded-full bg-blue-700 text-white hover:bg-blue-800"
            >
              {messages.focusReport.ctaLabel}
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-200">
            {metrics.map((metric) => {
              const toneClass =
                metric.tone === "up"
                  ? "text-emerald-600"
                  : metric.tone === "down"
                    ? "text-rose-600"
                    : "text-slate-500";

              return (
                <div
                  key={metric.key}
                  className="flex items-center justify-between gap-4 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-lg`}
                    >
                      {metric.imageSrc ? (
                        <img
                          src={metric.imageSrc}
                          alt={`${metric.label} logo`}
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        <i className={metric.icon}></i>
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {metric.label}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {metric.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end items-end gap-1">
                    <div className="bg-slate-100 px-2 py-0.5 rounded-full w-fit text-xs text-right">
                      <p className="font-semibold text-slate-900">
                        {metric.value}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <span className={`text-xs font-semibold ${toneClass}`}>
                        {metric.meta}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
