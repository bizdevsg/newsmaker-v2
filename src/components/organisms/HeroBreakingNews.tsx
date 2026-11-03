"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../atoms/Button";
import type { Locale } from "@/locales";
import type { ActiveBreakingNews } from "@/types/breakingNews";

type HeroBreakingNewsProps = {
  locale: Locale;
  initial: ActiveBreakingNews | null;
  fallbackImage: string;
  children: React.ReactNode;
};

const POLL_INTERVAL_MS = 30_000;

export function HeroBreakingNews({
  locale,
  initial,
  fallbackImage,
  children,
}: HeroBreakingNewsProps) {
  const [active, setActive] = useState(initial);

  // Berita baru muncul di tab yang sudah terbuka tanpa perlu refresh.
  useEffect(() => {
    const refresh = async () => {
      if (document.hidden) return;
      try {
        const response = await fetch(
          `/api/breaking-news/active?locale=${locale}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as {
          data?: ActiveBreakingNews | null;
        };
        setActive(payload.data ?? null);
      } catch {
        // Tetap tampilkan state terakhir, timer di bawah yang menutupnya.
      }
    };

    const id = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [locale]);

  // Sisa waktu dari server, jadi tidak tergantung jam di perangkat pengunjung.
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setActive(null), active.remainingMs);
    return () => window.clearTimeout(id);
  }, [active]);

  if (!active) return <>{children}</>;

  return (
    <Link
      href={active.href}
      className="group relative block overflow-hidden rounded-xl border-2 border-red-600 text-white shadow-lg shadow-red-900/30 no-underline"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url('${active.image ?? fallbackImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-red-900/70 to-red-900/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      <div className="relative flex min-h-[310px] h-full flex-col justify-between gap-4 p-7 sm:min-h-[340px]">
        <div className="space-y-3">
          <span
            role="status"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-red-900/40 ring-1 ring-red-400"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            {active.category
              ? `Breaking News · ${active.category}`
              : "Breaking News"}
          </span>
          <h2 className="max-w-2xl text-2xl font-semibold leading-snug sm:text-3xl">
            {active.title}
          </h2>
          <p className="text-sm font-semibold text-white/80">
            {active.timeLabel}
          </p>
        </div>

        <Button
          as="span"
          variant="outline"
          size="sm"
          className="border-white/60 bg-white text-slate-900 hover:bg-white/95 w-fit"
        >
          {locale === "en" ? "Read More" : "Baca Selengkapnya"}
        </Button>
      </div>
    </Link>
  );
}
