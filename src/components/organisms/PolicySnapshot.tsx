import React from "react";
import { Card } from "../atoms/Card";
import { SnapshotCard } from "../molecules/SnapshotCard";
import type { Locale, Messages } from "@/locales";
import type {
  BappebtiRegulationItem,
  BappebtiRegulationResponse,
  BiRateResponse,
  JfxVolumeResponse,
  OjkRegulationResponse,
} from "@/types/indonesiaMarket";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { SectionHeader } from "../molecules/SectionHeader";

type PolicySnapshotProps = {
  messages: Messages;
  locale?: Locale;
};

const API_TOKEN = process.env.ENDPO_NM23_TOKEN ?? "";
const API_BASE =
  process.env.ENDPO_NM23_BASE ??
  process.env.NEXT_PUBLIC_ENDPOAPI_BASE ??
  "https://endpo-nm23.vercel.app";

const API_ENDPOINTS = {
  biRate: `${API_BASE}/api/newsmaker-v2/bi-rate`,
  ojkRegulation: `${API_BASE}/api/newsmaker-v2/ojk/regulasi`,
  bappebtiRegulation: `${API_BASE}/api/newsmaker-v2/bappebti`,
  jfxVolume: `${API_BASE}/api/newsmaker-v2/jfx/volume`,
};

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
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

const formatVolume = (value: number | undefined, locale: Locale) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID").format(
    value,
  );
};

const formatMonthYear = (
  month: number | undefined,
  year: number | undefined,
  locale: Locale,
) => {
  if (!month || !year) return undefined;
  const date = new Date(Date.UTC(year, month - 1, 1));
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const getJfxVolumeSummary = (
  response: JfxVolumeResponse | null | undefined,
) => {
  const rows = Array.isArray(response?.data) ? response.data : [];
  if (rows.length === 0) return undefined;

  const items = rows
    .map((row) => ({
      label: typeof row.label === "string" ? row.label.trim() : "",
      volume: typeof row.volume === "number" ? row.volume : Number.NaN,
    }))
    .filter((row) => row.label && Number.isFinite(row.volume));

  if (items.length === 0) return undefined;

  const total = items.reduce((acc, row) => acc + row.volume, 0);
  const top = [...items].sort((a, b) => b.volume - a.volume)[0];

  return {
    total,
    topLabel: top?.label,
    topVolume: top?.volume,
    month: typeof response?.month === "number" ? response.month : undefined,
    year: typeof response?.year === "number" ? response.year : undefined,
    fetchedAt:
      typeof response?.fetched_at === "string"
        ? response.fetched_at
        : undefined,
  };
};

const getLatestBappebtiItem = (
  response?: BappebtiRegulationResponse | null,
) => {
  const categories = Array.isArray(response?.data) ? response.data : [];
  const items = categories.flatMap((category) =>
    Array.isArray(category.data) ? category.data : [],
  );

  if (items.length === 0) return undefined;

  const itemsWithTimestamp = items.map((item) => {
    const rawTimestamp =
      typeof item.tanggal_iso === "string"
        ? new Date(item.tanggal_iso).getTime()
        : Number.NaN;
    return {
      item,
      timestamp: Number.isNaN(rawTimestamp)
        ? Number.NEGATIVE_INFINITY
        : rawTimestamp,
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
  jfxVolumeResponse?: JfxVolumeResponse | null,
) => {
  const placeholder = "—";

  const latestBiRate = biRateResponse?.data?.[0];
  const biRateValue =
    latestBiRate?.raw_rate?.replace(/\s+/g, "") ??
    formatPercent(latestBiRate?.rate);
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
    formatDateForSnapshot(
      normalizeText(ojkRegulationResponse?.fetched_at),
      locale,
    );

  const latestBappebti = getLatestBappebtiItem(bappebtiRegulationResponse);
  const bappebtiSummary = truncateText(
    normalizeText(latestBappebti?.tentang) ??
      normalizeText(latestBappebti?.judul),
  );
  const bappebtiDate = resolveBappebtiDateLabel(latestBappebti, locale);

  const jfxSummary = getJfxVolumeSummary(jfxVolumeResponse);
  const jfxTotal = formatVolume(jfxSummary?.total, locale);
  const jfxMonthYear = formatMonthYear(
    jfxSummary?.month,
    jfxSummary?.year,
    locale,
  );
  const jfxFetchedAt = formatDateForSnapshot(jfxSummary?.fetchedAt, locale);
  const jfxTopLabel = jfxSummary?.topLabel;
  const jfxTopVolume = formatVolume(jfxSummary?.topVolume, locale);

  const baseItems = messages.policySnapshot.items.map((item) => {
    if (item.key === "bi-rate") {
      return {
        ...item,
        value: placeholder,
        subtitle: placeholder,
        meta: placeholder,
      };
    }

    if (item.key === "ojk-update") {
      return {
        ...item,
        subtitle: placeholder,
        meta: placeholder,
      };
    }

    if (item.key === "bappebti-circular") {
      return {
        ...item,
        subtitle: placeholder,
        meta: placeholder,
      };
    }

    if (item.key === "bbj-activity") {
      return {
        ...item,
        value: placeholder,
        subtitle: placeholder,
        meta: placeholder,
      };
    }

    return item;
  });

  return baseItems.map((item) => {
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

    if (item.key === "bbj-activity") {
      const subtitle =
        locale === "en"
          ? `Total volume${jfxMonthYear ? ` ${jfxMonthYear}` : ""}`
          : `Total volume${jfxMonthYear ? ` ${jfxMonthYear}` : ""}`;

      const metaParts = [
        jfxTopLabel && jfxTopVolume
          ? `${locale === "en" ? "Top" : "Top"} ${jfxTopLabel} ${jfxTopVolume}`
          : undefined,
        jfxFetchedAt,
      ].filter((part): part is string => Boolean(part));

      return {
        ...item,
        value: jfxTotal ?? item.value,
        subtitle: jfxTotal ? subtitle : item.subtitle,
        meta: metaParts.length ? metaParts.join(" • ") : item.meta,
      };
    }

    return item;
  });
};

export async function PolicySnapshot({
  messages,
  locale = "id",
}: PolicySnapshotProps) {
  const [
    biRateResponse,
    ojkRegulationResponse,
    bappebtiRegulationResponse,
    jfxVolumeResponse,
  ] = await Promise.all([
    fetchJson<BiRateResponse>(API_ENDPOINTS.biRate),
    fetchJson<OjkRegulationResponse>(API_ENDPOINTS.ojkRegulation),
    fetchJson<BappebtiRegulationResponse>(API_ENDPOINTS.bappebtiRegulation),
    fetchJson<JfxVolumeResponse>(API_ENDPOINTS.jfxVolume),
  ]);
  const items = buildItems(
    messages,
    locale,
    biRateResponse,
    ojkRegulationResponse,
    bappebtiRegulationResponse,
    jfxVolumeResponse,
  );
  return (
    <Card as="section" className="">
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
