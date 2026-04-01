"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Define local component types to mirror NewsItem
type InsightItem = {
  id: number;
  title?: string;
  content?: string;
  slug?: string;
  updated_at?: string;
  created_at?: string;
  kategori?: { name?: string; slug?: string; };
  images?: string[];
};

export function IndoMarketInsight({ 
  title = "Analisis Market", 
  category = "analisis-market", 
  limit = 4 
}: { 
  title?: string;
  category?: string;
  limit?: number;
}) {
  const { locale } = useParams<{ locale?: string }>();
  const [items, setItems] = useState<InsightItem[]>([]);
  const [imageBase, setImageBase] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const ANALYSIS_API_URL = `/api/portalnews?category=${category}&limit=${limit}`;
        const res = await fetch(ANALYSIS_API_URL);
        const payload = await res.json();
        if (!isActive || payload?.status !== "success") return;
        if (typeof payload.imageBase === "string") setImageBase(payload.imageBase);
        setItems(Array.isArray(payload.data) ? payload.data.slice(0, limit) : []);
      } catch { } finally {
        if (isActive) setIsLoading(false);
      }
    };
    load();
    return () => { isActive = false; };
  }, [category, limit]);

  const localePrefix = locale ? `/${locale}` : "";

  const resolveImage = (images?: string[]) => {
    if (!images || images.length === 0) return null;
    const first = images[0] ?? "";
    if (!first) return null;
    if (first.startsWith("http")) return first;
    return `${imageBase}${first.startsWith("/") ? first : `/${first}`}`;
  };

  const stripHtml = (html?: string) => {
    if (!html) return "";
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "en" ? "en-GB" : "id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-blue-900 border-b-2 border-blue-700 pb-2">
          {title}
        </h2>
        <Link href={`/${locale}/analysis/analysis-opinion`} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition">
          Terbaru {`>`}
        </Link>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${limit <= 2 ? "lg:grid-cols-2" : "lg:grid-cols-4"} gap-6`}>
        {isLoading ? (
          Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-4">
              <div className="w-full h-48 bg-slate-100 rounded-lg"></div>
              <div className="h-5 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-1/4"></div>
              <div className="h-20 bg-slate-100 rounded w-full"></div>
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">No analysis available.</p>
        ) : (
          items.map((item) => {
            const href = item.kategori?.slug && item.slug ? `${localePrefix}/news/${item.kategori.slug}/${item.slug}` : "#";
            const thumbnail = resolveImage(item.images);

            return (
              <div key={item.id} className="flex flex-col group border border-slate-100 rounded-lg overflow-hidden pb-4 transition hover:shadow-lg">
                <Link href={href} className="w-full h-48 sm:h-56 relative overflow-hidden block">
                  {thumbnail ? (
                    <img src={thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <i className="fa-regular fa-chart-line text-4xl text-slate-300"></i>
                    </div>
                  )}
                </Link>
                <div className="p-4 flex flex-col gap-2 flex-grow">
                  <Link href={href} className="block mt-1">
                    <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <span className="text-xs text-slate-400 font-medium tracking-wide">
                    {formatDate(item.created_at || item.updated_at)}
                  </span>
                  <p className="text-sm text-slate-500 my-2 line-clamp-3 leading-relaxed">
                    {stripHtml(item.content)}
                  </p>
                  <div className="mt-auto pt-2">
                    <Link href={href} className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition flex items-center gap-1">
                      Baca Selengkapnya {`>`}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
