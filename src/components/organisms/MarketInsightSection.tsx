"use client";

import React, { useEffect, useState } from "react";
import { InsightCard } from "../molecules/InsightCard";
import { SectionHeader } from "../molecules/SectionHeader";
import { useLoading } from "../providers/LoadingProvider";

type NewsItem = {
  id: number;
  title?: string;
  content?: string;
  created_at?: string;
  kategori?: {
    name?: string;
  };
  images?: string[];
};

const NEWS_API_URL = process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ?? "";
const NEWS_TOKEN = process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ?? "";
const NEWS_IMAGE_BASE = process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE ?? "";

const fallbackItem = [
  {
    title: "Harga Minyak di Atas $80: Bertahan atau Koreksi?",
    summary:
      "Energi terus naik di tengah ketegangan geopolitik. Area teknikal kunci akan menentukan arah berikutnya.",
    image:
      "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp",
  },
  {
    title: "Dolar AS Menguat, Pasar Tunggu Sinyal The Fed",
    summary:
      "Pelaku pasar bersikap hati-hati menjelang rilis data ekonomi terbaru dan arah kebijakan suku bunga.",
    image:
      "/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp",
  },
];

import type { Messages } from "@/locales";

type MarketInsightSectionProps = {
  locale?: string;
  messages?: Messages;
};

export function MarketInsightSection({ locale, messages }: MarketInsightSectionProps) {
  const loading = useLoading();
  const [insightItems, setInsightItems] = useState(fallbackItem);

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
      return text.length > 140 ? `${text.slice(0, 140).trim()}...` : text;
    };

    const pickImage = (images?: string[]) => {
      if (!images || images.length === 0) return fallbackItem[0].image;
      const first = images[0] ?? "";
      if (!first) return fallbackItem[0].image;
      return first.startsWith("http") ? first : `${NEWS_IMAGE_BASE}${first}`;
    };

    const load = async () => {
      const token = loading.start("market-insight-section");
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
          (item) => item.kategori?.name?.toLowerCase() === "market update",
        );

        if (!marketUpdates.length) return;

        const latestItems = [...marketUpdates].sort((a, b) => {
          const aTime = a.created_at ? Date.parse(a.created_at) : 0;
          const bTime = b.created_at ? Date.parse(b.created_at) : 0;
          return bTime - aTime;
        });

        const topTwo = latestItems.slice(0, 2);
        if (!topTwo.length) return;

        setInsightItems(
          topTwo.map((item) => ({
            title: item.title?.trim() || "Market Update",
            summary: toSummary(item.content),
            image: pickImage(item.images),
          })),
        );
      } catch {
        // keep fallback
      } finally {
        loading.stop(token);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="rounded-lg bg-white shadow overflow-hidden h-fit">
      <SectionHeader title={locale === "id" ? "Wawasan Pasar" : "Market Insights"} link="#" linkLabel={messages?.common?.readMore || "Read More..."} />
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {insightItems.map((item) => (
          <InsightCard
            key={item.title}
            title={item.title}
            summary={item.summary}
            imageSrc={item.image}
            ctaLabel="Read More"
          />
        ))}
      </div>
    </section>
  );
}
