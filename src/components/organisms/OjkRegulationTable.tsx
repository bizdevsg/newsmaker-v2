import React from "react";
import type { Locale } from "@/locales";
import type {
  OjkRegulationResponse,
  OjkRegulationRow,
} from "@/types/indonesiaMarket";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

type OjkRegulationTableProps = {
  locale: Locale;
};

const API_TOKEN = process.env.ENDPO_NM23_TOKEN ?? "";
const API_BASE = process.env.ENDPO_NM23_BASE ?? "";

const API_ENDPOINT = `${API_BASE}/api/newsmaker-v2/ojk/regulasi`;

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") return "-";
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || "-";
};

const resolveYear = (row: OjkRegulationRow) => {
  const tahunBerlaku = normalizeText(row.tahun_berlaku);
  if (tahunBerlaku !== "-") return tahunBerlaku;

  if (typeof row.tahun === "number" && Number.isFinite(row.tahun)) {
    return String(row.tahun);
  }

  if (typeof row.tahun === "string" && row.tahun.trim()) {
    return row.tahun.trim();
  }

  return undefined;
};

const formatFullDate = (value: string | undefined, locale: Locale) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const dateLocale = locale === "en" ? "en-US" : "id-ID";
  const date = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
  const time = new Intl.DateTimeFormat(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(parsed);

  return `${date} - ${time}`;
};

const getLabels = (locale: Locale) => {
  if (locale === "en") {
    return {
      kicker: "Financial Regulation",
      title: "OJK Regulations",
      subtitle: "Latest OJK regulatory publications.",
      updatedLabel: "Updated",
      emptyLabel: "OJK regulation data is not available yet.",
      countLabel: "regulations",
      pageLabel: "Page",
      numberLabel: "Number",
      sectorLabel: "Sector",
      subSectorLabel: "Sub-sector",
      effectiveYearLabel: "Effective Year",
      sourceLabel: "Source",
      openLabel: "Open",
      sourceName: "Indonesia Financial Services Authority",
    };
  }

  return {
    kicker: "Regulasi Keuangan",
    title: "Regulasi OJK",
    subtitle: "Daftar publikasi regulasi terbaru OJK.",
    updatedLabel: "Diperbarui",
    emptyLabel: "Data regulasi OJK belum tersedia.",
    countLabel: "regulasi",
    pageLabel: "Halaman",
    numberLabel: "Nomor",
    sectorLabel: "Sektor",
    subSectorLabel: "Sub-sektor",
    effectiveYearLabel: "Tahun Berlaku",
    sourceLabel: "Sumber",
    openLabel: "Buka",
    sourceName: "Otoritas Jasa Keuangan",
  };
};

export async function OjkRegulationTable({ locale }: OjkRegulationTableProps) {
  const response = await fetchJson<OjkRegulationResponse>(API_ENDPOINT);
  const rows = response?.data ?? [];
  const labels = getLabels(locale);
  const sourceHref = normalizeText(response?.source);
  const totalRegulations =
    typeof response?.count === "number" ? response.count : rows.length;
  const pageNumber = typeof response?.page === "number" ? response.page : 1;

  return (
    <section className="mt-3 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">
            {labels.kicker}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {labels.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{labels.subtitle}</p>
        </div>

        <div className="space-y-1 text-right text-xs text-slate-500">
          <p>
            {labels.updatedLabel}: {formatFullDate(response?.fetched_at, locale)}
          </p>
          <p>
            {totalRegulations} {labels.countLabel}
          </p>
          <p>
            {labels.pageLabel}: {pageNumber}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          {labels.emptyLabel}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((row, index) => {
            const regulationType = normalizeText(row.jenis);
            const number = normalizeText(row.nomor);
            const title = normalizeText(row.judul);
            const description = normalizeText(row.deskripsi);
            const sector = normalizeText(row.sektor);
            const subSector = normalizeText(row.sub_sektor);
            const effectiveYear = resolveYear(row);

            return (
              <article
                key={`${number}-${index}`}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    {regulationType}
                  </span>
                  <span className="text-slate-500">
                    {labels.numberLabel}: {number}
                  </span>
                </div>

                <h2 className="mt-2 text-base font-semibold text-slate-900">
                  {row.url ? (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-700"
                    >
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </h2>

                <p className="mt-2 text-sm text-slate-600">{description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    {labels.sectorLabel}: {sector}
                  </span>
                  <span>
                    {labels.subSectorLabel}: {subSector}
                  </span>
                  {effectiveYear ? (
                    <span>
                      {labels.effectiveYearLabel}: {effectiveYear}
                    </span>
                  ) : null}
                </div>

                {row.url ? (
                  <div className="mt-3">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      {labels.openLabel}
                    </a>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {sourceHref !== "-" ? (
        <div className="mt-5 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">{labels.sourceLabel}:</span>{" "}
          <a
            href={sourceHref}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-blue-700 hover:text-blue-900"
          >
            {labels.sourceName}
          </a>
        </div>
      ) : null}
    </section>
  );
}
