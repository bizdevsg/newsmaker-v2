import React from "react";
import Link from "next/link";
import type { Locale, Messages } from "@/locales";

type SiteFooterProps = {
  locale: Locale;
  messages: Messages;
};

export function SiteFooter({ locale, messages }: SiteFooterProps) {
  const localeLabel = locale.toUpperCase();

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
              <span>{localeLabel}</span>
              <span className="text-white/40">|</span>
              <span>{messages.footer.reports}</span>
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
