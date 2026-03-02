import React from "react";
import { TickerBar } from "./TickerBar";

const footerLinks = [
  { label: "About", href: "#" },
  { label: "Research", href: "#" },
  { label: "Insights", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Careers", href: "#" },
];

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Disclaimer", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="px-4 pb-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <TickerBar />
        <div className="rounded-md bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="text-lg font-semibold tracking-[0.2em]">
              NEWSMAKER 23
            </div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/70">
              <span>EN</span>
              <span className="text-white/40">|</span>
              <span>Reports</span>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-6 border-t border-white/15 px-6 py-3 text-sm text-white/80">
            {footerLinks.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-white">
                {link.label}
              </a>
            ))}
            <div className="ml-auto flex flex-wrap items-center gap-4 text-xs text-white/70">
              {legalLinks.map((link) => (
                <a
                  key={link.label}
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
          <span>Newsmaker Research · Indonesia Market Coverage</span>
          <span>© 2026 Newsmaker Research. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
