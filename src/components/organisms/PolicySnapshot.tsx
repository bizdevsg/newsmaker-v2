import React from "react";
import { Card } from "../atoms/Card";
import { SnapshotCard } from "../molecules/SnapshotCard";
import type { Locale, Messages } from "@/locales";
import type {
  BappebtiRegulationItem,
  BappebtiRegulationResponse,
  BiRateResponse,
  OjkRegulationResponse,
} from "@/types/indonesiaMarket";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { SectionHeader } from "../molecules/SectionHeader";

type PolicySnapshotProps = {
  messages: Messages;
  locale?: Locale;
};

const API_TOKEN = process.env.ENDPO_NM23_TOKEN ?? "";
const API_BASE = process.env.ENDPO_NM23_BASE ?? "";

const API_ENDPOINTS = {
  biRate: `${API_BASE}/api/newsmaker-v2/bi-rate`,
  ojkRegulation: `${API_BASE}/api/newsmaker-v2/ojk/regulasi`,
  bappebtiRegulation: `${API_BASE}/api/newsmaker-v2/bappebti`,
};

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetchWithTimeout(url, {
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

const formatPercent = (value: number | undefined) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || undefined;
};

const truncateText = (value: string | undefined, limit = 140) => {
  if (!value) return undefined;
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1).trimEnd()}...`;
};

const formatDateForSnapshot = (value: string | undefined, locale: Locale) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const getLatestBappebtiItem = (response?: BappebtiRegulationResponse | null) => {
  const categories = Array.isArray(response?.data) ? response.data : [];
  const items = categories.flatMap((category) =>
    Array.isArray(category.data) ? category.data : [],
  );

  if (items.length === 0) return undefined;

  const itemsWithTimestamp = items.map((item) => {
    const rawTimestamp =
      typeof item.tanggal_iso === "string" ? new Date(item.tanggal_iso).getTime() : Number.NaN;
    return {
      item,
      timestamp: Number.isNaN(rawTimestamp) ? Number.NEGATIVE_INFINITY : rawTimestamp,
    };
  });

  itemsWithTimestamp.sort((a, b) => b.timestamp - a.timestamp);
  return itemsWithTimestamp[0]?.item;
};

const buildBiRateSummary = (locale: Locale, rateLabel: string | undefined) => {
  if (!rateLabel) return undefined;
  return locale === "en"
    ? `Latest BI Rate decision at ${rateLabel}.`
    : `Keputusan BI-Rate terbaru di level ${rateLabel}.`;
};

const resolveBappebtiDateLabel = (
  item: BappebtiRegulationItem | undefined,
  locale: Locale,
) => {
  const rawDate = normalizeText(item?.tanggal);
  if (rawDate) return rawDate;
  return formatDateForSnapshot(normalizeText(item?.tanggal_iso), locale);
};

const buildItems = (
  messages: Messages,
  locale: Locale,
  biRateResponse?: BiRateResponse | null,
  ojkRegulationResponse?: OjkRegulationResponse | null,
  bappebtiRegulationResponse?: BappebtiRegulationResponse | null,
) => {
  const latestBiRate = biRateResponse?.data?.[0];
  const biRateValue =
    latestBiRate?.raw_rate?.replace(/\s+/g, "") ?? formatPercent(latestBiRate?.rate);
  const biRateSummary = buildBiRateSummary(locale, biRateValue);
  const biRateDate =
    normalizeText(latestBiRate?.raw_date) ??
    formatDateForSnapshot(normalizeText(latestBiRate?.date), locale);

  const latestOjk = ojkRegulationResponse?.data?.[0];
  const ojkSummary = truncateText(
    normalizeText(latestOjk?.deskripsi) ?? normalizeText(latestOjk?.judul),
  );
  const ojkDate =
    normalizeText(latestOjk?.tahun_berlaku) ??
    (typeof latestOjk?.tahun === "number"
      ? String(latestOjk.tahun)
      : normalizeText(latestOjk?.tahun)) ??
    formatDateForSnapshot(normalizeText(ojkRegulationResponse?.fetched_at), locale);

  const latestBappebti = getLatestBappebtiItem(bappebtiRegulationResponse);
  const bappebtiSummary = truncateText(
    normalizeText(latestBappebti?.tentang) ?? normalizeText(latestBappebti?.judul),
  );
  const bappebtiDate = resolveBappebtiDateLabel(latestBappebti, locale);

  return messages.policySnapshot.items.map((item) => {
    if (item.key === "bi-rate") {
      return {
        ...item,
        value: biRateValue ?? item.value,
        subtitle: biRateSummary ?? item.subtitle,
        meta: biRateDate ?? item.meta,
      };
    }

    if (item.key === "ojk-update") {
      return {
        ...item,
        subtitle: ojkSummary ?? item.subtitle,
        meta: ojkDate ?? item.meta,
      };
    }

    if (item.key === "bappebti-circular") {
      return {
        ...item,
        subtitle: bappebtiSummary ?? item.subtitle,
        meta: bappebtiDate ?? item.meta,
      };
    }

    return item;
  });
};

export async function PolicySnapshot({
  messages,
  locale = "id",
}: PolicySnapshotProps) {
  const [biRateResponse, ojkRegulationResponse, bappebtiRegulationResponse] =
    await Promise.all([
      fetchJson<BiRateResponse>(API_ENDPOINTS.biRate),
      fetchJson<OjkRegulationResponse>(API_ENDPOINTS.ojkRegulation),
      fetchJson<BappebtiRegulationResponse>(API_ENDPOINTS.bappebtiRegulation),
    ]);
  const items = buildItems(
    messages,
    locale,
    biRateResponse,
    ojkRegulationResponse,
    bappebtiRegulationResponse,
  );
  return (
    <Card as="section">
      <SectionHeader title={messages.policySnapshot.title} />
      <div className="grid gap-4 px-6 pb-6 pt-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <SnapshotCard
            key={item.key}
            itemKey={item.key}
            locale={locale}
            icon={item.icon}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            meta={item.meta}
          />
        ))}
      </div>
    </Card>
  );
}
