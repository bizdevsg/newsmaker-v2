"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../atoms/Button";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/locales";
import { WorldTimeBar } from "./WorldTimeBar";

export function SiteHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = useMemo(() => {
    const segment = pathname.split("/")[1] || "id";
    return segment === "en" ? "en" : "id";
  }, [pathname]);

  const nextLocale = currentLocale === "en" ? "id" : "en";
  const localeLabel = currentLocale.toUpperCase();
  const nextLocaleLabel = nextLocale.toUpperCase();
  const messages = getMessages(currentLocale);
  const changeLanguageLabel = messages.header.changeLanguageAria.replace(
    "{locale}",
    nextLocaleLabel,
  );

  const buildNavHref = (key: string) =>
    key === "home" ? `/${currentLocale}` : `/${currentLocale}/${key}`;
  const normalizedPath = pathname.replace(/\/$/, "") || `/${currentLocale}`;
  const isNavActive = (key: string) => {
    const itemHref = buildNavHref(key);
    if (key === "home") {
      return normalizedPath === itemHref;
    }
    return (
      normalizedPath === itemHref || normalizedPath.startsWith(`${itemHref}/`)
    );
  };

  const toggleLanguage = () => {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const nextPath = segments.join("/") || `/${nextLocale}`;
    router.push(nextPath);
  };

  useEffect(() => {
    if (!isMobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileOpen]);

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 text-white shadow-xl">
      <div className="px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/${currentLocale}`}>
              <img
                src="/assets/NewsMaker-23-logo-white.png"
                alt="NewsMaker 23"
                className="h-10 w-auto sm:h-12 lg:h-14"
              />
            </Link>
          </div>
          <div className="hidden w-full flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-white/70 md:flex md:w-auto md:justify-end md:tracking-[0.25em]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleLanguage}
                className="rounded border border-white/40 px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-white/90 transition hover:border-white/70 hover:text-white"
                aria-label={changeLanguageLabel}
              >
                {localeLabel}
              </button>
              <span className="text-white/40">|</span>
              <span className="hidden sm:inline">
                {messages.header.reports}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primaryAlt"
                size="sm"
                className="text-white/90"
                href="https://ebook.newsmaker.id/register"
              >
                {messages.header.register}
              </Button>
              {/* <Button
              variant="outline"
              size="sm"
              className="border-white/40 text-white"
            >
              Menu
            </Button> */}
            </div>
          </div>

          <button
            type="button"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav"
            className="rounded border border-blue-400 p-2 text-white md:hidden"
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            <i className="fa-solid fa-bars text-white"></i>
          </button>
        </div>
      </div>

      <hr className="border border-white/20" />

      <div className="px-4">
        <div className="mx-auto max-w-7xl">
          <nav className="hidden items-center gap-6 py-0 sm:px-6 md:px-8 text-sm text-white/80 md:flex md:flex-wrap sm:justify-between">
            {messages.header.navItems.map((item) =>
              (() => {
                const itemHref = buildNavHref(item.key);
                const isActive = isNavActive(item.key);
                return (
                  <Link
                    key={item.key}
                    href={itemHref}
                    className={`relative py-3 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-white/80 after:transition-transform after:duration-200 ${
                      isActive
                        ? "text-white after:scale-x-100"
                        : "text-white/70 hover:text-white after:scale-x-0 hover:after:scale-x-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })(),
            )}
          </nav>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`fixed inset-0 z-50 md:hidden ${
          isMobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isMobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform ${
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <span className="text-sm font-semibold text-slate-700">Menu</span>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600"
            >
              Close
            </button>
          </div>
          <div className="space-y-3 px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleLanguage}
                className="rounded border border-slate-200 px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                aria-label={changeLanguageLabel}
              >
                {localeLabel}
              </button>
              <span className="text-slate-300">|</span>
              <span>{messages.header.reports}</span>
            </div>
            <Button
              variant="secondaryAlt"
              size="sm"
              className="w-full"
              href="https://ebook.newsmaker.id/register"
            >
              {messages.header.register}
            </Button>
          </div>
          <WorldTimeBar
            tone="dark"
            compact
            className="md:hidden border-y border-slate-200/80 mb-3"
            containerClassName="px-4"
          />
          <nav className="flex flex-col gap-2 px-4 pb-4">
            {messages.header.navItems.map((item) =>
              (() => {
                const itemHref = buildNavHref(item.key);
                const isActive = isNavActive(item.key);
                return (
                  <Link
                    key={item.key}
                    href={itemHref}
                    onClick={() => setIsMobileOpen(false)}
                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })(),
            )}
          </nav>
        </aside>
      </div>
    </header>
  );
}
