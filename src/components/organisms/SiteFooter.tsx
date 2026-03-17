"use client";

import React from "react";
import Link from "next/link";
import type { Locale, Messages } from "@/locales";
import Image from "next/image";

type SiteFooterProps = {
  locale: Locale;
  messages: Messages;
};

const FOOTER_ROUTE_MAP: Record<string, string> = {
  "navigation:home": "",
  "news:index": "news",
  "news:commodity": "commodities",
  "news:currencies": "markets",
  "news:economy": "economic-news/economy",
  "news:fiscal": "economic-news/fiscal-moneter",
  "news:market-analysis": "news/analisis-market",
  "news:opinion": "insight",
  "news:crypto": "news/crypto",
  "tools:live-chart": "markets",
  "tools:economic-calendar": "data",
  "tools:historical-data": "policy",
  "tools:pivot-fibonacci": "policy",
  "tools:education": "reports",
  "contact:whatsapp": "https://wa.me/?text=Hello%20Newsmaker%2023",
};

const isExternalHref = (href: string) =>
  /^(https?:|mailto:|tel:)/i.test(href);

export function SiteFooter({ locale, messages }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();
  const resolveFooterHref = (columnKey: string, linkKey: string, href: string) => {
    if (href && href !== "#") return href;

    const mappedHref = FOOTER_ROUTE_MAP[`${columnKey}:${linkKey}`];
    if (!mappedHref) return "#";
    if (isExternalHref(mappedHref)) return mappedHref;
    return mappedHref ? `/${locale}/${mappedHref}` : `/${locale}`;
  };
  const copyrightText = messages.footer.copyright.replace(
    "{year}",
    String(currentYear),
  );

  return (
    <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white">
      {/* Top Section: Brand + Link Columns */}
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand Block */}
          <div className="flex flex-col gap-4 min-w-50">
            <Link href={`/${locale}/`} className="w-fit">
              <img
                src="/assets/NewsMaker-White 1.png"
                alt={messages.footer.brand}
                className="h-14 w-auto object-contain sm:h-16"
              />
            </Link>
            <div className="space-y-1 text-sm text-white/80">
              {messages.footer.brandDescription.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          {/* Link Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
            {messages.footer.columns.map((column) => (
              <div key={column.key} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
                  {column.title}
                </h3>
                <div className="h-0.5 w-6 bg-white/30"></div>
                <ul className="space-y-2 text-sm text-white/80">
                  {column.links.map((link) => (
                    <li key={link.key}>
                      {(() => {
                        const resolvedHref = resolveFooterHref(
                          column.key,
                          link.key,
                          link.href,
                        );

                        if (isExternalHref(resolvedHref)) {
                          return (
                            <a
                              href={resolvedHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition hover:text-white"
                            >
                              {link.label}
                            </a>
                          );
                        }

                        return (
                          <Link
                            href={resolvedHref}
                            className="transition hover:text-white"
                          >
                            {link.label}
                          </Link>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom Section: Copyright + Social + App Badges */}
      <div className="border-t border-white/20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          {/* Copyright */}
          <span>{copyrightText}</span>
          <div className="flex flex-col gap-4">
            {/* Social Icons */}
            <div className="flex items-center justify-start gap-3 text-white sm:justify-end">
              {messages.footer.socials.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-sm transition hover:border-white/70 hover:text-white"
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
            {/* App Badges */}
            <div className="flex flex-wrap items-center justify-start gap-3 sm:justify-end">
              {messages.footer.appBadges.map((badge) => (
                <a
                  key={badge.key}
                  href={badge.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-semibold text-slate-900 transition hover:scale-105"
                >
                  <Image
                    src={badge.img}
                    alt="Logo NM Ai"
                    width={130}
                    height={40}
                    className="h-10 object-contain"
                  />
                </a>
              ))}
              <a
                href="https://gwenstacy.newsmaker.id"
                className="flex items-center"
              >
                <Image
                  src="/assets/LogoNM23_Ai_22.png"
                  alt="Logo NM Ai"
                  width={48}
                  height={48}
                  className="h-10 w-10 object-contain"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
