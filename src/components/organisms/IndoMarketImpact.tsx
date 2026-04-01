"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type NewsItem = {
  id: number;
  title?: string;
  content?: string;
  slug?: string;
  updated_at?: string;
  created_at?: string;
  kategori?: { name?: string; slug?: string; };
  images?: string[];
};

const NEWS_API_URL = "/api/portalnews?limit=3"; // Or another category

export function IndoMarketImpact({ title = "Top Market Developments" }: { title?: string }) {
  const { locale } = useParams<{ locale?: string }>();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [imageBase, setImageBase] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const res = await fetch(NEWS_API_URL);
        const payload = await res.json();
        if (!isActive || payload?.status !== "success") return;
        if (typeof payload.imageBase === "string") setImageBase(payload.imageBase);
        setItems(Array.isArray(payload.data) ? payload.data.slice(0, 3) : []);
      } catch { } finally {
        if (isActive) setIsLoading(false);
      }
    };
    load();
    return () => { isActive = false; };
  }, []);

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
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex justify-between items-center mb-6 border-b border-blue-700 pb-2">
        <h2 className="text-xl font-medium text-blue-900 tracking-tight">
          {title}
        </h2>
        <Link href={`/${locale}/news`} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition">
          View All Developments
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="flex flex-col gap-3 animate-pulse">
              <div className="w-full h-40 bg-slate-100 rounded-lg"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2 mt-auto"></div>
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-slate-500 text-sm">No developments found.</p>
        ) : (
          items.map((item) => {
            const href = item.kategori?.slug && item.slug ? `${localePrefix}/news/${item.kategori.slug}/${item.slug}` : "#";
            const thumbnail = resolveImage(item.images);

            return (
              <div key={item.id} className="flex flex-col group border border-slate-100 rounded-lg overflow-hidden hover:shadow-md transition h-full">
                <Link href={href} className="w-full relative overflow-hidden h-40 shrink-0">
                  {thumbnail ? (
                    <img src={thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <i className="fa-regular fa-image text-3xl text-slate-300"></i>
                    </div>
                  )}
                </Link>
                <div className="w-full p-4 flex flex-col flex-grow bg-white">
                  <Link href={href} className="block mb-2">
                    <h3 className="text-[15px] font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition line-clamp-3">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-3 leading-relaxed">
                    {stripHtml(item.content)}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-50">
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDate(item.created_at || item.updated_at)}
                    </span>
                    <Link href={href} className="text-xs font-medium text-blue-600 hover:text-blue-800 transition">
                      Baca Analisis Lengkap
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
