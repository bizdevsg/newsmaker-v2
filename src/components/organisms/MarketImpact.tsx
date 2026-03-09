"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../atoms/Card";
import { ImpactCard } from "../molecules/ImpactCard";
import type { Messages } from "@/locales";
import { useLoading } from "../providers/LoadingProvider";

type MarketImpactProps = {
  messages: Messages;
};

export function MarketImpact({ messages }: MarketImpactProps) {
  const loading = useLoading();
  const [newsData, setNewsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const token = loading.start("market-impact");
      try {
        const res = await fetch("https://portalnews.newsmaker.id/api/v1/berita", {
          headers: {
            'Authorization': 'Bearer EWF-06433b884f930161'
          }
        });
        const json = await res.json();
        if (json && json.data) {
          // Sort data descending by date so we get the latest news
          const sortedData = json.data.sort((a: any, b: any) => {
            const dateA = new Date(a.updated_at || a.created_at).getTime();
            const dateB = new Date(b.updated_at || b.created_at).getTime();
            return dateB - dateA;
          });
          // Taking top 3 items
          setNewsData(sortedData.slice(0, 2));
        }
      } catch (err) {
        console.error("Failed to fetch news", err);
      } finally {
        setIsLoading(false);
        loading.stop(token);
      }
    };
    fetchNews();
  }, []);

  // Helper to strip html tags for summary safely on client side
  const stripHtml = (html: string) => {
    if (typeof document === 'undefined') return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const displayItems = newsData.map((item, index) => {
    const d = new Date(item.updated_at || item.created_at);
    // Format date generically like "24 Apr 2024"
    const formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    return {
      key: `news-${item.id || index}`,
      title: item.titles?.default || item.title,
      summary: stripHtml(item.content).substring(0, 150) + "...",
      date: formattedDate,
      imageLabel: item.images && item.images.length > 0 ? `https://portalnews.newsmaker.id/${item.images[0]}` : "./assets/Screenshot-2024-10-29-at-11.27.48.png"
    };
  });

  return (
    <Card as="section">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {messages.marketImpact.title}
        </h3>
        <a href="#" className="text-xs font-semibold text-blue-700">
          {messages.marketImpact.ctaLabel}
        </a>
      </div>
      <div className="px-6 pb-6 pt-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-sm font-semibold text-slate-500 py-4">Memuat berita...</div>
        ) : displayItems.length > 0 ? (
          displayItems.map((impact) => (
            <ImpactCard
              key={impact.key}
              title={impact.title}
              summary={impact.summary}
              date={impact.date}
              imageLabel={impact.imageLabel}
              ctaLabel={messages.common.readFullInsight}
            />
          ))
        ) : (
          <div className="text-center text-sm font-semibold text-slate-500 py-4">
            Berita tidak tersedia
          </div>
        )}
      </div>
    </Card>
  );
}
