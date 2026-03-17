"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MarketInsightHeader } from "../molecules/MarketInsightHeader";
import { MarketInsightBody } from "../molecules/MarketInsightBody";
import { useLoading } from "../providers/LoadingProvider";

type NewsItem = {
  id: number;
  title?: string;
  content?: string;
  slug?: string;
  updated_at?: string;
  created_at?: string;
  kategori?: {
    name?: string;
    slug?: string;
  };
  images?: string[];
};

const PORTALNEWS_API_ENDPOINT = "/api/portalnews?limit=1";

const fallbackHero = {
  title: "",
  description: "",
  image: "",
  ctaHref: "#",
};

export function MarketInsightHero() {
  const { locale } = useParams<{ locale?: string }>();
  const [hero, setHero] = useState(fallbackHero);
  const [isLoading, setIsLoading] = useState(true);
  const { start, stop } = useLoading();

  useEffect(() => {
    let isActive = true;

    const stripHtml = (value: string) =>
      value
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const toSummary = (content?: string) => {
      if (!content) return "Market update terbaru dari Newsmaker.";
      const text = stripHtml(content);
      if (!text) return "Market update terbaru dari Newsmaker.";
      return text.length > 180 ? `${text.slice(0, 180).trim()}...` : text;
    };

    const pickImage = (images?: string[], imageBase = "") => {
      if (!images || images.length === 0) return fallbackHero.image;
      const first = images[0] ?? "";
      if (!first) return fallbackHero.image;
      if (first.startsWith("http")) return first;
      const normalizedPath = first.startsWith("/") ? first : `/${first}`;
      return imageBase ? `${imageBase}${normalizedPath}` : normalizedPath;
    };

    const load = async () => {
      const token = start("market-insight");
      try {
        const response = await fetch(PORTALNEWS_API_ENDPOINT, {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) return;
        if (!isActive || payload?.status !== "success") return;

        const items: NewsItem[] = Array.isArray(payload.data) ? payload.data : [];
        const imageBase =
          typeof payload.imageBase === "string" ? payload.imageBase : "";
        const latest = items[0];

        if (!latest) return;

        const categorySlug = latest.kategori?.slug?.trim();
        const articleSlug = latest.slug?.trim();
        const localePrefix = locale ? `/${locale}` : "";

        setHero({
          title: latest.title?.trim() || "Market Insight",
          description: toSummary(latest.content),
          image: pickImage(latest.images, imageBase),
          ctaHref:
            categorySlug && articleSlug
              ? `${localePrefix}/news/${categorySlug}/${articleSlug}`
              : "#",
        });
      } catch {
        // keep fallback
      } finally {
        if (isActive) setIsLoading(false);
        stop(token);
      }
    };

    const initialTimer = window.setTimeout(load, 300);

    return () => {
      isActive = false;
      window.clearTimeout(initialTimer);
    };
  }, [locale, start, stop]);

  return (
    <section
      className="relative overflow-hidden rounded-lg bg-white shadow bg-cover bg-center"
      style={{
        backgroundImage:
          !isLoading && hero.image ? `url('${hero.image}')` : "none",
      }}
    >
      {isLoading ? (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-700/70 to-blue-200/50" />
      )}
      <MarketInsightHeader label="Insight" emphasis="Market" />
      {isLoading ? (
        <div className="relative z-10 px-6 pb-8 pt-4">
          <div className="h-7 w-3/4 animate-pulse rounded bg-white/40" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-white/30" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-white/30" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-white/30" />
          </div>
          <div className="mt-6 h-10 w-40 animate-pulse rounded bg-white/35" />
        </div>
      ) : (
        <MarketInsightBody
          title={hero.title}
          description={hero.description}
          ctaLabel="Read Full Insight"
          ctaHref={hero.ctaHref}
        />
      )}
    </section>
  );
}
