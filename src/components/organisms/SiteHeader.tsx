"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../atoms/Button";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/locales";
import { WorldTimeBar } from "./WorldTimeBar";

export function SiteHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpenDesktop, setIsLangOpenDesktop] = useState(false);
  const [isLangOpenMobile, setIsLangOpenMobile] = useState(false);
  const langDesktopRef = useRef<HTMLDivElement | null>(null);
  const langMobileRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = useMemo(() => {
    const segment = pathname.split("/")[1] || "id";
    return segment === "en" ? "en" : "id";
  }, [pathname]);

  const nextLocale = currentLocale === "en" ? "id" : "en";
  const nextLocaleLabel = nextLocale.toUpperCase();
  const localeFlagClass = currentLocale === "en" ? "fi-gb" : "fi-id";
  const messages = getMessages(currentLocale);
  const changeLanguageLabel = messages.header.changeLanguageAria.replace(
    "{locale}",
    nextLocaleLabel,
  );
  const todayLabel = useMemo(() => {
    const locale = currentLocale === "en" ? "en-GB" : "id-ID";
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }, [currentLocale]);

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

  const setLanguage = (value: string) => {
    const next = value === "en" ? "en" : "id";
    const segments = pathname.split("/");
    segments[1] = next;
    const nextPath = segments.join("/") || `/${next}`;
    router.push(nextPath);
  };

  useEffect(() => {
    if (!isLangOpenDesktop) return;
    const onClick = (event: MouseEvent) => {
      if (!langDesktopRef.current) return;
      if (!langDesktopRef.current.contains(event.target as Node)) {
        setIsLangOpenDesktop(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isLangOpenDesktop]);

  useEffect(() => {
    if (!isLangOpenMobile) return;
    const onClick = (event: MouseEvent) => {
      if (!langMobileRef.current) return;
      if (!langMobileRef.current.contains(event.target as Node)) {
        setIsLangOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isLangOpenMobile]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsLangOpenMobile(false);
  }, [pathname]);

  return (
    <header className="bg-linear-to-r from-blue-900 via-blue-700 to-blue-600 text-white shadow-xl">
      <div className="bg-[url(/assets/bg-cover.pg)]" />
      <div className="px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/${currentLocale}`}>
              <img
                src="/assets/NewsMaker-White 1.png"
                alt="NewsMaker 23"
                className="h-10 w-auto sm:h-12 lg:h-14"
              />
            </Link>
          </div>
          <div className="hidden w-full flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-white/70 md:flex md:w-auto md:justify-end md:tracking-[0.25em]">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold text-white/70">
                {todayLabel}
              </span>
              <div className="relative" ref={langDesktopRef}>
                <button
                  type="button"
                  onClick={() => setIsLangOpenDesktop((prev) => !prev)}
                  aria-label={changeLanguageLabel}
                  className="relative inline-flex h-7 w-7 items-center justify-center rounded cursor-pointer text-white/90 transition hover:border-white/70"
                >
                  <span
                    className={`fi ${localeFlagClass} h-3 w-4 rounded-sm`}
                  />
                </button>
                {isLangOpenDesktop && (
                  <div className="absolute right-0 mt-2 w-24 rounded-md border border-slate-200 bg-white py-1 text-xs font-semibold text-slate-700 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("id");
                        setIsLangOpenDesktop(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <span className="fi fi-id h-3 w-4 rounded-sm" />
                      ID
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("en");
                        setIsLangOpenDesktop(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <span className="fi fi-gb h-3 w-4 rounded-sm" />
                      EN
                    </button>
                  </div>
                )}
              </div>
              <span className="text-white/40">|</span>
              <Link
                href={`https://ebook.newsmaker.id/`}
                className="hidden sm:inline hover:text-white transition capitalize"
              >
                E-Book
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-44 rounded border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white placeholder:text-white/60 outline-none transition focus:border-white/70"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/80">
                  <i
                    className="fa-solid fa-magnifying-glass"
                    aria-hidden="true"
                  />
                </span>
              </div>
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
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <p className="text-base font-semibold text-slate-800">Menu</p>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <div className="relative" ref={langMobileRef}>
                  <button
                    type="button"
                    onClick={() => setIsLangOpenMobile((prev) => !prev)}
                    aria-label={changeLanguageLabel}
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                  >
                    <span
                      className={`fi ${localeFlagClass} h-3 w-4 rounded-sm`}
                    />
                  </button>
                  {isLangOpenMobile && (
                    <div className="absolute right-0 mt-2 w-24 rounded-md border border-slate-200 bg-white py-1 text-xs font-semibold text-slate-700 shadow-lg z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage("id");
                          setIsLangOpenMobile(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="fi fi-id h-3 w-4 rounded-sm" />
                        ID
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage("en");
                          setIsLangOpenMobile(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="fi fi-gb h-3 w-4 rounded-sm" />
                        EN
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="bg-blue-500/50 h-fit py-1 px-2 mt-3 rounded">
              <p className="text-[10px] font-semibold uppercase text-slate-800">
                {todayLabel}
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              <Link
                href={`https://ebook.newsmaker.id/`}
                className="flex w-full items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
              >
                E-Book
              </Link>
            </div>
            <div className="relative mt-3">
              <input
                type="search"
                placeholder="Search..."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 placeholder:text-slate-400 outline-none transition focus:border-blue-300"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                <i
                  className="fa-solid fa-magnifying-glass"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>

          <hr className="border-blue-500/20" />

          <nav className="flex flex-col gap-2 px-4 pb-4 mt-4">
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
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
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
