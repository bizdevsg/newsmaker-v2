import Link from "next/link";
import type { PortalNewsSearchResult } from "@/lib/portalnews-search";
import type { Locale, Messages } from "@/locales";

type SearchResultsSectionProps = {
  locale: Locale;
  messages: Messages;
  query: string;
  results: PortalNewsSearchResult[];
};

export function SearchResultsSection({
  locale,
  messages,
  query,
  results,
}: SearchResultsSectionProps) {
  const labels =
    locale === "en"
      ? {
          emptyHint: "Type a keyword to search news and analysis.",
          noResults: "No results found for",
          resultLabel: "results",
          searchTitle: "Search Results",
          topLabel: "Search",
        }
      : {
          emptyHint: "Ketik kata kunci untuk mencari berita dan analisis.",
          noResults: "Tidak ada hasil untuk",
          resultLabel: "hasil",
          searchTitle: "Hasil Pencarian",
          topLabel: "Pencarian",
        };

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="mb-8 flex flex-col gap-3 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-slate-400">
          <span>{labels.topLabel}</span>
          {query ? <span>/</span> : null}
          {query ? (
            <span className="normal-case tracking-normal text-slate-700">
              {query}
            </span>
          ) : null}
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          {labels.searchTitle}
        </h1>
        {query ? (
          <p className="text-sm text-slate-500">
            {results.length} {labels.resultLabel}
          </p>
        ) : (
          <p className="text-sm text-slate-500">{labels.emptyHint}</p>
        )}
      </div>

      {!query ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <i className="fa-solid fa-magnifying-glass text-3xl text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            {labels.emptyHint}
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <i className="fa-solid fa-magnifying-glass text-3xl text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            {labels.noResults} <span className="text-slate-700">{query}</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => {
            const formattedDate = item.date
              ? new Date(item.date).toLocaleDateString(
                  locale === "en" ? "en-US" : "id-ID",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )
              : "";

            return (
              <article
                key={item.id}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <Link href={item.href} className="flex h-full flex-col">
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-100 to-slate-200">
                        <i className="fa-solid fa-newspaper text-3xl text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                      <span>{item.category || "News"}</span>
                      {formattedDate ? (
                        <>
                          <span className="text-slate-300">/</span>
                          <span className="text-slate-400">
                            {formattedDate}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h2 className="line-clamp-3 text-base font-bold leading-snug text-slate-900 transition group-hover:text-blue-700">
                      {item.title}
                    </h2>
                    <p className="line-clamp-4 flex-1 text-sm leading-6 text-slate-500">
                      {item.summary}
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700">
                      {messages.equities?.newsCategories?.readMore ||
                        "Read More"}
                      <i className="fa-solid fa-arrow-right text-[10px]" />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
