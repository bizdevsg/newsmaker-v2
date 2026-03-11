"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Locale, Messages } from "@/locales";

type SiteFooterProps = {
  locale: Locale;
  messages: Messages;
};

export function SiteFooter({ locale, messages }: SiteFooterProps) {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = useMemo(() => {
    const segment = pathname.split("/")[1] || "id";
    return segment === "en" ? "en" : "id";
  }, [pathname]);

  const nextLocale = currentLocale === "en" ? "id" : "en";
  const localeLabel = currentLocale.toUpperCase();
  const nextLocaleLabel = nextLocale.toUpperCase();
  const changeLanguageLabel = messages.header.changeLanguageAria.replace(
    "{locale}",
    nextLocaleLabel,
  );

  const toggleLanguage = () => {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const nextPath = segments.join("/") || `/${nextLocale}`;
    router.push(nextPath);
  };

  return (
    <footer className="px-4 pb-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-md bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 text-white shadow-xl">
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href={`/${locale}/`}>
              <img
                src="/assets/NewsMaker-23-logo-white.png"
                alt={messages.footer.brand}
                className="h-15 object-contain sm:h-20 w-fit"
              />
            </Link>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/70">
              <button
                type="button"
                onClick={toggleLanguage}
                className="rounded border border-white/40 px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-white/90 transition hover:border-white/70 hover:text-white"
                aria-label={changeLanguageLabel}
              >
                {localeLabel}
              </button>
              <span className="text-white/40">|</span>
              <Link href={`/${currentLocale}/reports`} className="hover:text-white transition">
                {messages.footer.reports}
              </Link>
            </div>
          </div>
          <nav className="flex flex-col gap-3 border-t border-white/15 px-6 py-3 text-sm text-white/80 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            {messages.footer.footerLinks.map((link) => (
              <a key={link.key} href={link.href} className="hover:text-white">
                {link.label}
              </a>
            ))}
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 sm:ml-auto">
              {messages.footer.legalLinks.map((link) => (
                <a key={link.key} href={link.href} className="hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
        <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{messages.footer.coverage}</span>
          <span>{messages.footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
