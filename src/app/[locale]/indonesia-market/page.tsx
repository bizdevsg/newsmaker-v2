import { MarketPageTemplate } from "../../../components/templates/MarketPageTemplate";
import { HeroSection } from "../../../components/organisms/HeroSection";
import { PolicySnapshot } from "../../../components/organisms/PolicySnapshot";
import { RegulatoryWatch } from "../../../components/organisms/RegulatoryWatch";
import { MarketImpact } from "../../../components/organisms/MarketImpact";
import { ExchangeActivity } from "../../../components/organisms/ExchangeActivity";
import { FocusReport } from "../../../components/organisms/FocusReport";
import { RecentAnalysis } from "../../../components/organisms/RecentAnalysis";
import { getMessages, type Locale } from "@/locales";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indonesia Market",
};

const API_TOKEN =
  "BG0EvCDjcNWAMwmdewC1wz584oEGfU5QiKXGdZQ2qkOro8Hn4FD5OYLHOcUJtLuj";

const API_ENDPOINTS = {
  fx: "https://endpo-nm23.vercel.app/api/newsmaker-v2/fx",
  ihsg: "https://endpo-nm23.vercel.app/api/newsmaker-v2/market",
  biRate: "https://endpo-nm23.vercel.app/api/newsmaker-v2/bi-rate",
};

type FxRow = {
  currency?: string;
  unit?: number;
  sell?: number;
  buy?: number;
};

type FxResponse = {
  data?: FxRow[];
  fetched_at?: string;
};

type BiRateRow = {
  date?: string;
  rate?: number;
  raw_date?: string;
  raw_rate?: string;
};

type BiRateResponse = {
  data?: BiRateRow[];
  fetched_at?: string;
};

type IhsgResponse = {
  indices?: {
    composite?: MarketIndex;
    idx30?: MarketIndex;
    lq45?: MarketIndex;
    kompas100?: MarketIndex;
  };
  fetched_at?: string;
};

type MarketIndex = {
  last?: number;
  change?: number;
  change_percent?: number;
  direction?: "up" | "down";
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

const parseNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);

  const [fxResponse, ihsgResponse, biRateResponse] = await Promise.all([
    fetchJson<FxResponse>(API_ENDPOINTS.fx),
    fetchJson<IhsgResponse>(API_ENDPOINTS.ihsg),
    fetchJson<BiRateResponse>(API_ENDPOINTS.biRate),
  ]);

  const usdRow = fxResponse?.data?.find((row) => row.currency === "USD");
  const usdValue = formatNumber(usdRow?.sell);

  const biLatest = biRateResponse?.data?.[0];
  const biRateValue =
    biLatest?.raw_rate?.replace(/\s+/g, "") ?? formatPercent(biLatest?.rate);
  const biRateDate = biLatest?.raw_date ?? biLatest?.date;

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
  const formatChangePoints = (value?: number) => {
    if (value === undefined || Number.isNaN(value)) return undefined;
    const sign = value > 0 ? "+" : "";
    return `${sign}${formatNumber(value, 2)}`;
  };

  const buildIndexStat = (
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
      tone: (tone ?? fallback?.tone ?? "flat") as
        | "up"
        | "down"
        | "flat",
      meta: meta ?? fallback?.meta,
    };
  };

  const hydratedMessages = {
    ...messages,
    policySnapshot: {
      ...messages.policySnapshot,
      items: messages.policySnapshot.items.map((item) => {
        if (item.key !== "bi-rate") return item;
        return {
          ...item,
          value: biRateValue ?? item.value,
          subtitle: biRateDate ?? item.subtitle,
        };
      }),
    },
    exchangeActivity: {
      ...messages.exchangeActivity,
      stats: ihsgResponse?.indices
        ? [
            buildIndexStat(
              "composite",
              "IHSG",
              messages.exchangeActivity.stats[0],
            ),
            buildIndexStat(
              "idx30",
              "IDX30",
              messages.exchangeActivity.stats[1],
            ),
            buildIndexStat("lq45", "LQ45", messages.exchangeActivity.stats[2]),
            buildIndexStat(
              "kompas100",
              "Kompas100",
              messages.exchangeActivity.stats[3],
            ),
          ].map((stat) => ({
            key: stat.key,
            label: stat.label,
            value: stat.value,
            delta: stat.delta,
            tone: stat.tone,
          }))
        : messages.exchangeActivity.stats.map((stat) => {
            if (stat.key === "ihsg") {
              return {
                ...stat,
                value: ihsgValue
                  ? (formatNumber(ihsgValue) ?? stat.value)
                  : stat.value,
                delta: ihsgDelta
                  ? (formatPercent(ihsgDelta) ?? stat.delta)
                  : stat.delta,
                tone: ihsgTone ?? stat.tone,
              };
            }
            if (stat.key === "idr-usd") {
              return {
                ...stat,
                value: usdValue ?? stat.value,
              };
            }
            return stat;
          }),
    },
    focusReport: {
      ...messages.focusReport,
      metrics: ihsgResponse?.indices
        ? [
            buildIndexStat(
              "composite",
              "IHSG",
              messages.focusReport.metrics[0],
            ),
            buildIndexStat("idx30", "IDX30", messages.focusReport.metrics[1]),
            buildIndexStat("lq45", "LQ45", messages.focusReport.metrics[2]),
            buildIndexStat(
              "kompas100",
              "Kompas100",
              messages.focusReport.metrics[3],
            ),
          ].map((metric) => ({
            key: metric.key,
            label: metric.label,
            value: metric.value,
            delta: metric.delta,
            tone: metric.tone,
            meta: metric.meta ?? "",
          }))
        : messages.focusReport.metrics.map((metric) => {
            if (metric.key === "ihsg") {
              return {
                ...metric,
                value: ihsgValue
                  ? (formatNumber(ihsgValue) ?? metric.value)
                  : metric.value,
                delta: ihsgDelta
                  ? (formatPercent(ihsgDelta) ?? metric.delta)
                  : metric.delta,
                tone: ihsgTone ?? metric.tone,
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
          }),
    },
  };

  return (
    <MarketPageTemplate locale={locale} messages={hydratedMessages}>
      <HeroSection messages={hydratedMessages} />
      <PolicySnapshot messages={hydratedMessages} locale={locale} />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <RegulatoryWatch messages={hydratedMessages} />
          <ExchangeActivity messages={hydratedMessages} />
          <RecentAnalysis messages={hydratedMessages} />
        </div>
        <div className="space-y-6">
          <MarketImpact messages={hydratedMessages} />
          <FocusReport messages={hydratedMessages} />
        </div>
      </div>
    </MarketPageTemplate>
  );
}
