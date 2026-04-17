"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Container } from "@/components/layout/Container";
import { ScrollUpButton } from "@/components/organisms/ScrollUpButton";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { StickyNav } from "@/components/organisms/StickyNav";
import { TickerBar } from "@/components/organisms/TickerBar";
import { getMessages, type Locale } from "@/locales";

const resolveLocaleFromPathname = (pathname: string): Locale => {
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return segment === "en" ? "en" : "id";
};

export default function NotFound() {
  const pathname = usePathname() ?? "/";
  const locale = useMemo(() => resolveLocaleFromPathname(pathname), [pathname]);
  const messages = useMemo(() => getMessages(locale), [locale]);

  const title = locale === "en" ? "Page not found" : "Halaman tidak ditemukan";
  const subtitle =
    locale === "en"
      ? "The page you’re looking for doesn’t exist or has been moved."
      : "Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.";
  const backLabel = locale === "en" ? "Go Back" : "Kembali";

  return (
    <div className="relative min-h-screen overflow-x-clip text-slate-800">
      <div className="relative z-10 nm-bg-cover bg-cover bg-center bg-no-repeat bg-fixed">
        <StickyNav>
          <nav>
            <div className="mx-auto w-full">
              <SiteHeader />
            </div>
          </nav>
        </StickyNav>

        <div className="">
          <div className="mx-auto w-full">
            <TickerBar
              locale={locale}
              topNews={messages.widgets?.tickerBar?.topNews}
            />
          </div>
        </div>

        <div className="px-4">
          <Container as="section" className="py-10 sm:py-14">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-slate-50" />
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-slate-200/50 blur-3xl" />

                <div className="relative px-6 py-10 sm:px-10 sm:py-12">
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-blue-700">
                        404
                      </p>
                      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        {title}
                      </h1>
                      <p className="mt-3 text-sm font-semibold text-slate-600 max-w-xl">
                        {subtitle}
                      </p>
                    </div>

                    <div className="hidden sm:flex shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <span
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              i % 3 === 0
                                ? "bg-blue-700"
                                : i % 2 === 0
                                  ? "bg-blue-300"
                                  : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <Button href={`/${locale}`} variant="primary" size="md">
                      <i className="fa-solid fa-house" aria-hidden="true" />
                      {locale === "en" ? "Home" : "Beranda"}
                    </Button>
                    <Button href={`/${locale}/news`} variant="outline" size="md">
                      <i className="fa-solid fa-newspaper" aria-hidden="true" />
                      {locale === "en" ? "News" : "Berita"}
                    </Button>
                    <Button
                      href={`/${locale}/economic-news`}
                      variant="outline"
                      size="md"
                    >
                      <i className="fa-solid fa-chart-line" aria-hidden="true" />
                      {locale === "en"
                        ? "Economic News"
                        : "Berita Ekonomi"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => window.history.back()}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                      {backLabel}
                    </button>
                  </div>

                  <div className="mt-9 grid gap-3 sm:grid-cols-2">
                    <Link
                      href={`/${locale}/tools/historical-data`}
                      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:border-blue-200 hover:text-blue-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <i
                          className="fa-solid fa-chart-simple text-[12px]"
                          aria-hidden="true"
                        />
                        {locale === "en" ? "Historical Data" : "Data Historis"}
                      </span>
                      <i
                        className="fa-solid fa-arrow-right text-[12px] text-slate-300 group-hover:text-blue-400"
                        aria-hidden="true"
                      />
                    </Link>
                    <Link
                      href={`/${locale}/tools/pivot-fibonacci`}
                      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:border-blue-200 hover:text-blue-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <i
                          className="fa-solid fa-compass-drafting text-[12px]"
                          aria-hidden="true"
                        />
                        {locale === "en"
                          ? "Pivot & Fibonacci"
                          : "Pivot & Fibonacci"}
                      </span>
                      <i
                        className="fa-solid fa-arrow-right text-[12px] text-slate-300 group-hover:text-blue-400"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>

                  <p className="mt-8 text-[11px] font-semibold text-slate-400">
                    {locale === "en" ? "Path" : "Path"}: {pathname}
                  </p>
                </div>
              </Card>

              <div className="hidden lg:block">
                <Card className="h-full overflow-hidden">
                  <div className="relative h-full">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-800 to-blue-950" />
                    <div className="absolute inset-0 opacity-20">
                      <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.55)_0,rgba(255,255,255,0)_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.45)_0,rgba(255,255,255,0)_50%),radial-gradient(circle_at_40%_85%,rgba(255,255,255,0.35)_0,rgba(255,255,255,0)_55%)]" />
                    </div>
                    <div className="relative h-full p-8">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/80">
                          Newsmaker
                        </p>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/90">
                          <i className="fa-solid fa-signal" aria-hidden="true" />
                          {locale === "en" ? "Live Market" : "Live Market"}
                        </span>
                      </div>

                      <div className="mt-10">
                        <div className="text-white">
                          <p className="text-sm font-semibold text-white/80">
                            {locale === "en"
                              ? "Quick navigation"
                              : "Navigasi cepat"}
                          </p>
                          <div className="mt-4 space-y-3">
                            {[
                              { href: `/${locale}/news/commodity`, icon: "fa-coins", label: "Commodity" },
                              { href: `/${locale}/news/index`, icon: "fa-chart-area", label: "Index" },
                              { href: `/${locale}/news/currencies`, icon: "fa-dollar-sign", label: "Currencies" },
                              { href: `/${locale}/news/crypto`, icon: "fa-bitcoin-sign", label: "Crypto" },
                            ].map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                              >
                                <span className="inline-flex items-center gap-3">
                                  <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                                  {item.label}
                                </span>
                                <i className="fa-solid fa-arrow-right text-xs text-white/60 group-hover:text-white/90" aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs font-semibold text-white/80">
                          {locale === "en"
                            ? "Tip: use Search in News to find an article quickly."
                            : "Tips: gunakan Search di halaman News untuk menemukan artikel."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </div>

        <ScrollUpButton />

        <div className="mt-5">
          <SiteFooter locale={locale} messages={messages} />
        </div>
      </div>
    </div>
  );
}
