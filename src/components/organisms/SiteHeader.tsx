"use client";

import React, { useMemo, useState } from "react";
import { Button } from "../atoms/Button";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/locales";

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

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 text-white shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:py-4 lg:px-0">
        <div className="flex items-center gap-4">
          <Link href={`/${currentLocale}`}>
            <img
              src="/assets/NewsMaker-23-logo-white.png"
              alt="NewsMaker 23"
              className="h-10 w-auto sm:h-12 lg:h-14"
            />
          </Link>
        </div>
        <div className="hidden w-full flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-white/70 sm:flex sm:w-auto sm:justify-end sm:tracking-[0.25em]">
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
            <span className="hidden sm:inline">{messages.header.reports}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primaryAlt" size="sm" className="text-white/90">
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
          className="rounded border border-blue-400 p-2 text-white sm:hidden"
          onClick={() => setIsMobileOpen((prev) => !prev)}
        >
          <i className="fa-solid fa-bars text-white"></i>
        </button>
      </div>

      <hr className="border border-white/20" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
        <div
          id="mobile-nav"
          className={`sm:hidden ${isMobileOpen ? "block" : "hidden"}`}
        >
          <div className="pt-3 space-y-3 text-xs uppercase tracking-[0.2em] text-white/70">
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
              <span>{messages.header.reports}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondaryAlt" size="sm" className="w-full">
                {messages.header.register}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 pb-3">
            {messages.header.navItems.map((item) =>
              (() => {
                const itemHref = buildNavHref(item.key);
                const isActive = isNavActive(item.key);
                return (
                  <Link
                    key={item.key}
                    href={itemHref}
                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })(),
            )}
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-white/80 sm:flex sm:flex-wrap sm:justify-between">
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
    </header>
  );
}
