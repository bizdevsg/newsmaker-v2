import React from "react";
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
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="text-lg font-semibold tracking-[0.2em]">
              {messages.footer.brand}
            </div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/70">
              <span>{localeLabel}</span>
              <span className="text-white/40">|</span>
              <span>{messages.footer.reports}</span>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-6 border-t border-white/15 px-6 py-3 text-sm text-white/80">
            {messages.footer.footerLinks.map((link) => (
              <a key={link.key} href={link.href} className="hover:text-white">
                {link.label}
              </a>
            ))}
            <div className="ml-auto flex flex-wrap items-center gap-4 text-xs text-white/70">
              {messages.footer.legalLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>{messages.footer.coverage}</span>
          <span>{messages.footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
