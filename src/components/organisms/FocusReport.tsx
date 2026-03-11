import React from "react";
import { Card } from "../atoms/Card";
import { Button } from "../atoms/Button";
import type { Messages } from "@/locales";
import type {
  FxResponse,
  IhsgResponse,
} from "@/types/indonesiaMarket";

type FocusReportProps = {
  messages: Messages;
};

const API_TOKEN = process.env.ENDPO_NM23_TOKEN ?? "";
const API_BASE = process.env.ENDPO_NM23_BASE ?? "";

const API_ENDPOINTS = {
  fx: `${API_BASE}/api/newsmaker-v2/fx`,
  ihsg: `${API_BASE}/api/newsmaker-v2/market`,
};

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 60 },
    });
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

const formatPercent = (value: number | undefined) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

const formatChangePoints = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, 2)}`;
};

const buildIndexMetric = (
  ihsgResponse: IhsgResponse | null | undefined,
  key: "composite" | "idx30" | "lq45" | "kompas100",
  label: string,
  fallback?: { value: string; delta: string; tone?: string; meta?: string },
) => {
  const data = ihsgResponse?.indices?.[key];
  const value = formatNumber(parseNumber(data?.last));
  const delta = formatPercent(parseNumber(data?.change_percent));
  const tone =
    data?.direction === "down"
      ? "down"
      : data?.direction === "up"
        ? "up"
        : "flat";
  const meta = formatChangePoints(parseNumber(data?.change));
  return {
    key: key === "composite" ? "ihsg" : key,
    label,
    value: value ?? fallback?.value ?? "-",
    delta: delta ?? fallback?.delta ?? "-",
    tone: (tone ?? fallback?.tone ?? "flat") as "up" | "down" | "flat",
    meta: meta ?? fallback?.meta ?? "",
  };
};

export async function FocusReport({ messages }: FocusReportProps) {
  const [fxResponse, ihsgResponse] = await Promise.all([
    fetchJson<FxResponse>(API_ENDPOINTS.fx),
    fetchJson<IhsgResponse>(API_ENDPOINTS.ihsg),
  ]);

  const usdRow = fxResponse?.data?.find((row) => row.currency === "USD");
  const usdValue = formatNumber(usdRow?.sell);

  const ihsgData = ihsgResponse?.indices?.composite;
  const ihsgValue = parseNumber(ihsgData?.last) ?? undefined;
  const ihsgChange = parseNumber(ihsgData?.change);
  const ihsgDelta =
    parseNumber(ihsgData?.change_percent) ??
    (ihsgValue && ihsgChange ? (ihsgChange / ihsgValue) * 100 : undefined);
  const ihsgTone =
    ihsgData?.direction === "down"
      ? "down"
      : ihsgData?.direction === "up"
        ? "up"
        : ihsgDelta !== undefined
          ? ihsgDelta < 0
            ? "down"
            : "up"
          : undefined;

  const metrics = ihsgResponse?.indices
    ? [
        buildIndexMetric(
          ihsgResponse,
          "composite",
          "IHSG",
          messages.focusReport.metrics[0],
        ),
        buildIndexMetric(
          ihsgResponse,
          "idx30",
          "IDX30",
          messages.focusReport.metrics[1],
        ),
        buildIndexMetric(
          ihsgResponse,
          "lq45",
          "LQ45",
          messages.focusReport.metrics[2],
        ),
        buildIndexMetric(
          ihsgResponse,
          "kompas100",
          "Kompas100",
          messages.focusReport.metrics[3],
        ),
      ]
    : messages.focusReport.metrics.map((metric) => {
        if (metric.key === "ihsg") {
          return {
            ...metric,
            value: ihsgValue ? (formatNumber(ihsgValue) ?? metric.value) : metric.value,
            delta: ihsgDelta ? (formatPercent(ihsgDelta) ?? metric.delta) : metric.delta,
            tone: (ihsgTone ?? metric.tone) as "up" | "down" | "flat",
            meta: formatChangePoints(ihsgChange) ?? metric.meta,
          };
        }
        if (metric.key === "usd") {
          return {
            ...metric,
            value: usdValue ?? metric.value,
          };
        }
        return metric;
      });

  return (
    <Card as="section" className="p-6">
      <div className="rounded-md bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          {messages.focusReport.kicker}
        </p>
        <h3 className="mt-3 text-2xl font-semibold">
          {messages.focusReport.title}
        </h3>
        <p className="mt-2 text-sm text-white/70">
          {messages.focusReport.subtitle}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 border-white/40 text-white"
        >
          {messages.focusReport.ctaLabel}
        </Button>
      </div>
      <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
        <div className="divide-y divide-slate-200">
          {metrics.map((metric) => {
            const toneClass =
              metric.tone === "up"
                ? "text-emerald-600"
                : metric.tone === "down"
                  ? "text-rose-600"
                  : "text-slate-500";

            const initials = metric.label
              .split(/[^A-Za-z0-9]+/)
              .filter(Boolean)
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={metric.key}
                className="flex items-center justify-between gap-4 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-blue-700">
                    {initials}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {metric.label}
                    </p>
                    <p className="text-base font-semibold text-slate-800">
                      {metric.value}
                    </p>
                    <p className="text-[11px] text-slate-400">{metric.meta}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold ${toneClass}`}>
                    {metric.delta}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}


