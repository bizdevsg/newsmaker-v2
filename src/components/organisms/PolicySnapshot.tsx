import React from "react";
import Link from "next/link";
import { Card } from "../atoms/Card";
import { SnapshotCard } from "../molecules/SnapshotCard";
import type { Locale, Messages } from "@/locales";
import type { BiRateResponse } from "@/types/indonesiaMarket";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

type PolicySnapshotProps = {
  messages: Messages;
  locale?: Locale;
};

const API_TOKEN = process.env.ENDPO_NM23_TOKEN ?? "";
const API_BASE = process.env.ENDPO_NM23_BASE ?? "";

const API_ENDPOINTS = {
  biRate: `${API_BASE}/api/newsmaker-v2/bi-rate`,
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

const buildItems = (
  messages: Messages,
  biRateResponse?: BiRateResponse | null,
) => {
  const latest = biRateResponse?.data?.[0];
  const value =
    latest?.raw_rate?.replace(/\s+/g, "") ?? formatPercent(latest?.rate);
  const date = latest?.raw_date ?? latest?.date;

  return messages.policySnapshot.items.map((item) => {
    if (item.key !== "bi-rate") return item;
    return {
      ...item,
      value: value ?? item.value,
      subtitle: date ?? item.subtitle,
    };
  });
};

export async function PolicySnapshot({
  messages,
  locale,
}: PolicySnapshotProps) {
  const policyHref = locale ? `/${locale}/policy` : "#";
  const biRateHref = locale ? `/${locale}/indonesia-market/bi-rate` : "#";
  const externalLinks: Record<string, string> = {
    "ojk-update": "https://www.ojk.go.id/",
    "bappebti-circular": "https://bappebti.go.id/",
  };
  const biRateResponse = await fetchJson<BiRateResponse>(API_ENDPOINTS.biRate);
  const items = buildItems(messages, biRateResponse);
  return (
    <Card as="section">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {messages.policySnapshot.title}
        </h3>
        <Link
          href={policyHref}
          className="text-xs font-semibold text-blue-700 transition-colors hover:text-slate-800"
        >
          {messages.policySnapshot.ctaLabel}
        </Link>
      </div>
      <div className="grid gap-4 px-6 pb-6 pt-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const isBiRate = item.key === "bi-rate";
          const externalHref = externalLinks[item.key];
          const href = isBiRate ? biRateHref : externalHref ?? policyHref;
          const isExternal = Boolean(externalHref);

          return (
            <Link
              key={item.key}
              href={href}
              className="block"
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
            >
              <SnapshotCard
                icon={item.icon}
                title={item.title}
                value={item.value}
                subtitle={item.subtitle}
                meta={item.meta}
              />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
