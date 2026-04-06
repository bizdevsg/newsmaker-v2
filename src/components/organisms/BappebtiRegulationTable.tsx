import React from "react";
import Link from "next/link";
import type { Locale } from "@/locales";
import type {
  BappebtiRegulationCategory,
  BappebtiRegulationItem,
  BappebtiRegulationResponse,
} from "@/types/indonesiaMarket";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

type BappebtiRegulationTableProps = {
  locale: Locale;
  selectedCategoryKey?: string;
  page: number;
};

const API_TOKEN = process.env.ENDPO_NM23_TOKEN ?? "";
const API_BASE = process.env.ENDPO_NM23_BASE ?? "";

const API_ENDPOINT = `${API_BASE}/api/newsmaker-v2/bappebti`;
const PAGE_SIZE = 10;

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

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeCategoryKey = (value: string | undefined) =>
  (value ?? "").trim().toLowerCase();

const getCategoryKey = (
  category: BappebtiRegulationCategory,
  index: number,
) => {
  const key = normalizeText(category.key);
  if (key !== "-") {
    return key;
  }

  const label = normalizeText(category.label);
  if (label !== "-") {
    const labelSlug = toSlug(label);
    if (labelSlug) return labelSlug;
  }

  return `category-${index + 1}`;
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

const formatItemDate = (item: BappebtiRegulationItem, locale: Locale) => {
  const rawDate = normalizeText(item.tanggal);
  if (rawDate !== "-") return rawDate;

  if (typeof item.tanggal_iso === "string" && item.tanggal_iso.trim()) {
    const parsed = new Date(item.tanggal_iso);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(parsed);
    }
    return item.tanggal_iso;
  }

  return "-";
};

const getLabels = (locale: Locale) => {
  if (locale === "en") {
    return {
      kicker: "Commodity Futures Regulation",
      title: "Bappebti Regulations",
      subtitle: "Latest regulation references published by Bappebti.",
      updatedLabel: "Updated",
      emptyLabel: "Bappebti regulation data is not available yet.",
      countLabel: "Documents",
      categoryLabel: "categories",
      sourceLabel: "Source",
      openLabel: "Open",
      dateLabel: "Date",
      scopeLabel: "Scope",
      aboutLabel: "About",
      relatedLinksLabel: "Related Links",
      pagesFetchedLabel: "Pages Fetched",
      categoryMenuLabel: "Choose Category",
      applyCategoryLabel: "Apply",
      previousLabel: "Previous",
      nextLabel: "Next",
      pageLabel: "Page",
      sourceName: "Commodity Futures Trading Regulatory Agency (CoFTRA)",
    };
  }

  return {
    kicker: "Regulasi Perdagangan Berjangka",
    title: "Regulasi Bappebti",
    subtitle: "Referensi regulasi terbaru yang dipublikasikan Bappebti.",
    updatedLabel: "Diperbarui",
    emptyLabel: "Data regulasi Bappebti belum tersedia.",
    countLabel: "Dokumen",
    categoryLabel: "kategori",
    sourceLabel: "Sumber",
    openLabel: "Buka",
    dateLabel: "Tanggal",
    scopeLabel: "Ruang Lingkup",
    aboutLabel: "Tentang",
    relatedLinksLabel: "Link Terkait",
    pagesFetchedLabel: "Halaman Diambil",
    categoryMenuLabel: "Pilih Kategori",
    applyCategoryLabel: "Terapkan",
    previousLabel: "Sebelumnya",
    nextLabel: "Berikutnya",
    pageLabel: "Halaman",
    sourceName: "Badan Pengawas Perdagangan Berjangka Komoditi (Bappebti)",
  };
};

const getCategoryItems = (category: BappebtiRegulationCategory) =>
  Array.isArray(category.data) ? category.data : [];

export async function BappebtiRegulationTable({
  locale,
  selectedCategoryKey,
  page,
}: BappebtiRegulationTableProps) {
  const response = await fetchJson<BappebtiRegulationResponse>(API_ENDPOINT);
  const labels = getLabels(locale);
  const categories = Array.isArray(response?.data) ? response.data : [];
  const categoryEntries = categories.map((category, index) => ({
    category,
    key: getCategoryKey(category, index),
  }));
  const selectedKey = normalizeCategoryKey(selectedCategoryKey);
  const activeCategoryEntry =
    categoryEntries.find(
      (entry) => normalizeCategoryKey(entry.key) === selectedKey,
    ) ?? categoryEntries[0];
  const displayedCategoryEntries = activeCategoryEntry
    ? [activeCategoryEntry]
    : [];
  const buildCategoryHref = (categoryKey: string, targetPage = 1) => {
    const params = new URLSearchParams();
    params.set("kategori", categoryKey);
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    }
    return `/${locale}/regulasi-bappebti?${params.toString()}`;
  };
  const totalCount =
    typeof response?.count === "number"
      ? response.count
      : categories.reduce(
          (total, category) => total + getCategoryItems(category).length,
          0,
        );
  const categoriesCount =
    typeof response?.categories_count === "number"
      ? response.categories_count
      : categories.length;
  const sourceLinks = Array.isArray(response?.source) ? response.source : [];
  const primarySource =
    sourceLinks.find((source) => normalizeText(source) !== "-") ?? "";

  return (
    <section className="mt-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
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

        <div className="space-y-1 text-left text-xs text-slate-500 sm:text-right">
          <p>
            {labels.updatedLabel}:{" "}
            {formatFullDate(response?.fetched_at, locale)}
          </p>
          <p>
            {totalCount} {labels.countLabel}
          </p>
          <p>
            {categoriesCount} {labels.categoryLabel}
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          {labels.emptyLabel}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {labels.categoryMenuLabel}
            </p>
            <form
              action={`/${locale}/regulasi-bappebti`}
              method="get"
              className="mt-2 grid grid-cols-1 gap-2 sm:hidden"
            >
              <select
                name="kategori"
                defaultValue={activeCategoryEntry?.key ?? ""}
                className="h-9 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
              >
                {categoryEntries.map(({ category, key }) => {
                  const categoryLabel = normalizeText(category.label);

                  return (
                    <option key={`mobile-${key}`} value={key}>
                      {categoryLabel}
                    </option>
                  );
                })}
              </select>
              <button
                type="submit"
                className="h-9 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {labels.applyCategoryLabel}
              </button>
            </form>
            <div className="mt-2 hidden gap-2 sm:flex">
              {categoryEntries.map(({ category, key }) => {
                const categoryLabel = normalizeText(category.label);
                const isActive =
                  activeCategoryEntry &&
                  normalizeCategoryKey(activeCategoryEntry.key) ===
                    normalizeCategoryKey(key);

                return (
                  <Link
                    key={`menu-${key}`}
                    href={buildCategoryHref(key)}
                    className={`rounded-md w-full border px-3 py-1 text-xs text-center font-semibold transition ${
                      isActive
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {categoryLabel}
                  </Link>
                );
              })}
            </div>
          </div>

          {displayedCategoryEntries.map(({ category, key }) => {
            const items = getCategoryItems(category);
            const categoryLabel = normalizeText(category.label);
            const categoryCount =
              typeof category.count === "number"
                ? category.count
                : items.length;
            const categorySource = normalizeText(category.source);
            const pagesFetched =
              typeof category.pages_fetched === "number"
                ? category.pages_fetched
                : undefined;
            const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
            const currentPage = Math.min(Math.max(page, 1), totalPages);
            const startIndex = (currentPage - 1) * PAGE_SIZE;
            const paginatedItems = items.slice(
              startIndex,
              startIndex + PAGE_SIZE,
            );
            const pageStatus = `${labels.pageLabel} ${currentPage}/${totalPages}`;

            const paginationItems: Array<
              number | "left-ellipsis" | "right-ellipsis"
            > = [];
            if (totalPages > 1) {
              const windowSize = 5;
              const halfWindow = Math.floor(windowSize / 2);
              let startPage = Math.max(1, currentPage - halfWindow);
              const endPage = Math.min(totalPages, startPage + windowSize - 1);

              if (endPage - startPage < windowSize - 1) {
                startPage = Math.max(1, endPage - windowSize + 1);
              }

              if (startPage > 1) {
                paginationItems.push(1);
                if (startPage > 2) {
                  paginationItems.push("left-ellipsis");
                }
              }

              for (
                let pageNumber = startPage;
                pageNumber <= endPage;
                pageNumber += 1
              ) {
                paginationItems.push(pageNumber);
              }

              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  paginationItems.push("right-ellipsis");
                }
                paginationItems.push(totalPages);
              }
            }

            return (
              <section
                key={key}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <div className="border-b border-slate-100 px-3 py-3 sm:px-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-base font-semibold text-slate-900">
                      {categoryLabel}
                    </h2>
                    <div className="flex flex-col flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>
                        {categoryCount} {labels.countLabel}
                      </span>
                      {pagesFetched ? (
                        <span>
                          {labels.pagesFetchedLabel}: {pagesFetched}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {categorySource !== "-" ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {labels.sourceLabel}:{" "}
                      <a
                        href={categorySource}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-700 break-all hover:text-blue-900"
                      >
                        {labels.sourceName}
                      </a>
                    </p>
                  ) : null}
                </div>

                {items.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-slate-500">
                    {labels.emptyLabel}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {paginatedItems.map((item, index) => {
                      const title = normalizeText(item.judul);
                      const about = normalizeText(item.tentang);
                      const scope = normalizeText(item.tupoksi);
                      const itemDate = formatItemDate(item, locale);
                      const detailUrl = normalizeText(item.detail_url);
                      const relatedLinks = Array.isArray(item.links)
                        ? item.links.filter(
                            (link) =>
                              normalizeText(link.url) !== "-" &&
                              normalizeText(link.judul) !== "-",
                          )
                        : [];

                      return (
                        <article
                          key={`${title}-${startIndex + index}`}
                          className="px-3 py-4 sm:px-4"
                        >
                          <h3 className="text-sm font-semibold leading-snug text-slate-900 break-words">
                            {detailUrl !== "-" ? (
                              <a
                                href={detailUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="break-words hover:text-blue-700"
                              >
                                {title}
                              </a>
                            ) : (
                              title
                            )}
                          </h3>

                          {about !== "-" ? (
                            <p className="mt-2 text-sm text-slate-600 break-words">
                              <span className="font-semibold text-slate-700">
                                {labels.aboutLabel}:
                              </span>{" "}
                              {about}
                            </p>
                          ) : null}

                          <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
                            <span>
                              {labels.dateLabel}: {itemDate}
                            </span>
                            {scope !== "-" ? (
                              <span>
                                {labels.scopeLabel}: {scope}
                              </span>
                            ) : null}
                          </div>

                          {relatedLinks.length > 0 ? (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-slate-600">
                                {labels.relatedLinksLabel}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {relatedLinks.map((link) => {
                                  const linkUrl = normalizeText(link.url);
                                  const linkTitle = normalizeText(link.judul);

                                  return (
                                    <a
                                      key={`${linkUrl}-${linkTitle}`}
                                      href={linkUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="max-w-full break-words rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                                    >
                                      {linkTitle}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          {detailUrl !== "-" ? (
                            <div className="mt-3">
                              <a
                                href={detailUrl}
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

                    {totalPages > 1 ? (
                      <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <p className="text-xs text-slate-500">{pageStatus}</p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            href={buildCategoryHref(
                              key,
                              Math.max(1, currentPage - 1),
                            )}
                            aria-disabled={currentPage === 1}
                            className={`inline-flex items-center whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                              currentPage === 1
                                ? "pointer-events-none border-slate-200 text-slate-300"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {labels.previousLabel}
                          </Link>

                          {paginationItems.map((item) => {
                            if (
                              item === "left-ellipsis" ||
                              item === "right-ellipsis"
                            ) {
                              return (
                                <span
                                  key={item}
                                  className="px-1 text-xs font-semibold text-slate-400"
                                >
                                  ...
                                </span>
                              );
                            }

                            if (item === currentPage) {
                              return (
                                <span
                                  key={item}
                                  aria-current="page"
                                  className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-blue-700 px-2 text-xs font-semibold text-white"
                                >
                                  {item}
                                </span>
                              );
                            }

                            return (
                              <Link
                                key={item}
                                href={buildCategoryHref(key, item)}
                                className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-slate-200 px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                {item}
                              </Link>
                            );
                          })}

                          <Link
                            href={buildCategoryHref(
                              key,
                              Math.min(totalPages, currentPage + 1),
                            )}
                            aria-disabled={currentPage === totalPages}
                            className={`inline-flex items-center whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                              currentPage === totalPages
                                ? "pointer-events-none border-slate-200 text-slate-300"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {labels.nextLabel}
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {normalizeText(primarySource) !== "-" ? (
        <div className="mt-5 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">
            {labels.sourceLabel}:
          </span>{" "}
          <a
            href={primarySource}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-blue-700 break-all hover:text-blue-900"
          >
            {labels.sourceName}
          </a>
        </div>
      ) : null}
    </section>
  );
}
