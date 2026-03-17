"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import type { Locale, Messages } from "@/locales";

type HomeDownloadModalProps = {
  locale: Locale;
  messages: Messages;
};

export function HomeDownloadModal({ locale, messages }: HomeDownloadModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const copy = useMemo(() => {
    if (locale === "en") {
      return {
        title: "Get the NewsMaker 23 App",
        description:
          "Track markets, insights, and breaking updates faster on the go.",
        cta: "Download now",
      };
    }
    return {
      title: "Download Aplikasi NewsMaker 23",
      description:
        "Pantau pasar, insight, dan update terbaru lebih cepat di mobile.",
      cta: "Unduh sekarang",
    };
  }, [locale]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.22),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.12),_transparent_28%)]" />
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/50 hover:text-white"
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                {copy.cta}
              </p>
              <h2 className="max-w-xl text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
                {copy.title}
              </h2>
              <p className="max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                {copy.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {messages.footer.appBadges.map((badge) => (
                <a
                  key={badge.key}
                  href={badge.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <Image
                    src={badge.img}
                    alt={badge.label}
                    width={160}
                    height={48}
                    className="h-10 w-auto object-contain"
                  />
                </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/65">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
                <i className="fa-solid fa-bolt text-[10px]" aria-hidden="true" />
                Market update real-time
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
                <i className="fa-solid fa-chart-line text-[10px]" aria-hidden="true" />
                Insight dalam satu app
              </span>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-48 sm:w-56">
              <div className="absolute -inset-4 rounded-[3rem] bg-blue-400/15 blur-2xl" />
              <div className="relative rounded-[2.8rem] border border-white/10 bg-slate-950 p-2 shadow-[0_30px_80px_rgba(15,23,42,0.55)]">
                <div className="pointer-events-none absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-950" />
                <div className="pointer-events-none absolute left-1/2 top-5 z-20 h-2 w-10 -translate-x-1/2 rounded-full bg-slate-700/80" />
                <div className="pointer-events-none absolute right-[4.6rem] top-[1.15rem] z-20 h-2.5 w-2.5 rounded-full bg-slate-800 ring-2 ring-slate-700/70" />

                <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.2rem] bg-gradient-to-b from-blue-500 via-blue-600 to-slate-950">
                  <video
                    className="h-full w-full object-cover"
                    src="/assets/Download.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0)_45%,rgba(15,23,42,0.22)_100%)]" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="rounded-2xl border border-white/15 bg-slate-950/45 px-3 py-2 backdrop-blur-md">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
                        NewsMaker 23
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Markets, insight, and live updates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
