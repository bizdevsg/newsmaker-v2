"use client";

import React, { useEffect, useState } from "react";
import { MarketInsightHeader } from "../molecules/MarketInsightHeader";
import { MarketInsightBody } from "../molecules/MarketInsightBody";
import { useLoading } from "../providers/LoadingProvider";

type NewsItem = {
  id: number;
  title?: string;
  content?: string;
  slug?: string;
  created_at?: string;
  kategori?: {
    name?: string;
  };
  images?: string[];
};

const NEWS_API_URL = "https://portalnews.newsmaker.id/api/v1/berita";
const NEWS_TOKEN = "EWF-06433b884f930161";
const NEWS_IMAGE_BASE = "https://portalnews.newsmaker.id/";

const fallbackHero = {
  title: "",
  description: "",
  image: "",
  ctaHref: "#",
};

export function MarketInsightHero() {
  const [hero, setHero] = useState(fallbackHero);
  const [isLoading, setIsLoading] = useState(true);
  const loading = useLoading();

  useEffect(() => {
    let isActive = true;

    const stripHtml = (value: string) =>
      value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    const toSummary = (content?: string) => {
      if (!content) return "Market update terbaru dari Newsmaker.";
      const text = stripHtml(content);
      if (!text) return "Market update terbaru dari Newsmaker.";
      return text.length > 180 ? `${text.slice(0, 180).trim()}...` : text;
    };

    const pickImage = (images?: string[]) => {
      if (!images || images.length === 0) return fallbackHero.image;
      const first = images[0] ?? "";
      if (!first) return fallbackHero.image;
      return first.startsWith("http")
        ? first
        : `${NEWS_IMAGE_BASE}${first}`;
    };

    const load = async () => {
      const token = loading.start("market-insight");
      try {
        const response = await fetch(NEWS_API_URL, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${NEWS_TOKEN}`,
          },
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (!isActive || payload?.status !== "success") return;

        const items: NewsItem[] = Array.isArray(payload.data)
          ? payload.data
          : [];

        const marketUpdates = items.filter(
          (item) =>
            item.kategori?.name?.toLowerCase() === "market update",
        );

        if (!marketUpdates.length) return;

        const latest = [...marketUpdates].sort((a, b) => {
          const aTime = a.created_at ? Date.parse(a.created_at) : 0;
          const bTime = b.created_at ? Date.parse(b.created_at) : 0;
          return bTime - aTime;
        })[0];

        if (!latest) return;

        setHero({
          title: latest.title?.trim() || "Market Update",
          description: toSummary(latest.content),
          image: pickImage(latest.images),
          ctaHref: latest.slug ? `/news/${latest.slug}` : "#",
        });
      } catch {
        // keep fallback
      } finally {
        if (isActive) setIsLoading(false);
        loading.stop(token);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

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
