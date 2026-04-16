"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Locale, Messages } from "@/locales";

type SiteFooterProps = {
  locale: Locale;
  messages: Messages;
};

export function SiteFooter({ locale, messages }: SiteFooterProps) {
  const homeHref = `/${locale}`;

  const isExternalHref = (href: string) =>
    /^(https?:|mailto:|tel:)/i.test(href);

  const year = new Date().getFullYear();
  const rawCopyright =
    messages.footer.copyright?.replace("{year}", String(year)) ??
    `\u00A9 ${year} News.Maker23 - All Rights Reserved.`;
  const copyrightText = rawCopyright.replace("\u00C2\u00A9", "\u00A9");

  const resolveNewsHref = (linkKey: string) => {
    const map: Record<string, string> = {
      crypto: `${homeHref}/news/crypto`,
      index: `${homeHref}/news/index/nikkei`,
      commodity: `${homeHref}/news/commodity/gold`,
      currencies: `${homeHref}/news/currencies/eur-usd`,
      economy: `${homeHref}/economic-news/global-economy`,
      fiscal: `${homeHref}/economic-news/fiscal-monetary`,
      "market-analysis": `${homeHref}/analysis/market-analysis`,
      opinion: `${homeHref}/analysis/analisis-opinion`,
    };

    return map[linkKey] ?? `${homeHref}/news`;
  };

  const resolveFooterHref = (
    columnKey: string,
    linkKey: string,
    href: string,
  ) => {
    if (href && href !== "#") return href;

    if (columnKey === "navigation" && linkKey === "home") return homeHref;
    if (columnKey === "contact" && linkKey === "whatsapp") {
      return "https://wa.me/?text=Hello%20Newsmaker%2023";
    }

    if (columnKey === "tools" && linkKey === "economic-calendar") {
      return `${homeHref}/analysis/economic-calendar`;
    }
    if (columnKey === "tools" && linkKey === "live-chart") {
      return `${homeHref}/analysis/live-chart`;
    }
    if (columnKey === "tools" && linkKey === "historical-data") {
      return `${homeHref}/tools/historical-data`;
    }
    if (columnKey === "tools" && linkKey === "pivot-fibonacci") {
      return `${homeHref}/tools/pivot-fibonacci`;
    }
    if (columnKey === "tools" && linkKey === "education") {
      return "https://ebook.newsmaker.id/";
    }

    if (columnKey === "news") return resolveNewsHref(linkKey);

    return "#";
  };

  const footerColumns = messages.footer.columns
    .filter(
      (column) =>
        column.key === "navigation" ||
        column.key === "news" ||
        column.key === "tools" ||
        column.key === "contact",
    )
    .map((column) => ({
      key: column.key,
      title: column.title,
      links: column.links.map((link) => ({
        key: link.key,
        label: link.label,
        href: resolveFooterHref(column.key, link.key, link.href),
      })),
    }));

  return (
    <footer className="bg-gradient-to-b from-[#1061B3] to-[#083D79] text-white">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="flex flex-col gap-10 py-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="mx-auto w-full max-w-sm text-center lg:mx-0 lg:text-left">
            <Link
              href={homeHref}
              aria-label="Newsmaker 23 home"
              className="inline-flex shrink-0"
            >
              <Image
                src="/assets/NewsMaker-White 1.png"
                alt="NewsMaker 23"
                width={190}
                height={60}
                priority={false}
              />
            </Link>

            {(messages.footer.brandDescription ?? []).length ? (
              <p className="mt-5 text-sm font-medium leading-relaxed text-white/90">
                {(messages.footer.brandDescription ?? []).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            ) : null}
          </div>

          <div className="grid w-full gap-10 sm:grid-cols-2 lg:w-auto lg:grid-cols-4 lg:gap-x-14">
            {footerColumns.map((column) => (
              <div key={column.key} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/95">
                  {column.title}
                </h3>
                <ul className="space-y-3 text-sm font-semibold text-white/90">
                  {column.links.map((link) => {
                    const resolvedHref = link.href;

                    if (isExternalHref(resolvedHref)) {
                      return (
                        <li key={link.key}>
                          <a
                            href={resolvedHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition hover:text-white"
                          >
                            {link.label}
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={link.key}>
                        <Link
                          href={resolvedHref}
                          className="transition hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/15 py-6">
          <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
            <p className="w-full text-center sm:text-left text-sm font-semibold text-white/95 md:flex-1">
              {copyrightText}
            </p>

            <div className="flex flex-col items-center gap-3 md:items-end">
              <div className="flex flex-wrap items-center justify-center gap-2.5 md:justify-end">
                {(messages.footer.socials ?? []).map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    aria-label={social.label}
                    title={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-9 place-items-center rounded-full bg-white text-[#083D79] transition hover:bg-white/90 sm:size-10"
                  >
                    <i
                      className={`${social.icon} text-base`}
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>

              <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row md:justify-end">
                <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
                  {(messages.footer.appBadges ?? []).map((badge) => (
                    <a
                      key={badge.key}
                      href={badge.href}
                      aria-label={badge.label}
                      title={badge.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Image
                        src={badge.img}
                        alt={badge.label}
                        width={140}
                        height={44}
                      />
                    </a>
                  ))}
                </div>

                <Image
                  src="/assets/LogoNM23_Ai_22.png"
                  alt="NM Ai"
                  width={60}
                  height={60}
                  className="shrink-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
