"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type NewsItem = {
  id: number;
  title?: string;
  slug?: string;
  updated_at?: string;
  created_at?: string;
  kategori?: { name?: string; slug?: string; };
  images?: string[];
};

const HIGHLIGHT_API_URL = "/api/portalnews?category=crypto&limit=6";

export function IndoMarketHighlight({ title = "Digital Assets" }: { title?: string }) {
  const { locale } = useParams<{ locale?: string }>();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [imageBase, setImageBase] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const res = await fetch(HIGHLIGHT_API_URL);
        const payload = await res.json();
        if (!isActive || payload?.status !== "success") return;
        if (typeof payload.imageBase === "string") setImageBase(payload.imageBase);
        setItems(Array.isArray(payload.data) ? payload.data.slice(0, 6) : []);
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

  const leftItems = items.slice(0, 3);
  const rightItems = items.slice(3, 6);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
      <div className="border-b border-slate-200 mb-6 flex">
        <h2 className="text-xl font-medium text-blue-900 border-b-2 border-blue-700 pb-2 mb-[-1px]">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        {/* Left Column: Text Links */}
        <div className="flex flex-col">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="py-4 border-b border-slate-100 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">No highlights available.</p>
          ) : (
            <div className="divide-y divide-slate-100 flex flex-col h-full">
              {leftItems.map((item) => {
                const href = item.kategori?.slug && item.slug ? `${localePrefix}/news/${item.kategori.slug}/${item.slug}` : "#";
                return (
                  <div key={item.id} className="py-4 first:pt-0 group">
                    <Link href={href} className="block">
                      <h3 className="text-[15px] font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">Peluang trading</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="flex flex-col gap-2 animate-pulse border border-slate-100 rounded-lg p-3">
                <div className="h-28 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-full mt-2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
                <div className="h-8 bg-blue-100 rounded w-full mt-auto" />
              </div>
            ))
          ) : (
            rightItems.map((item) => {
              const href = item.kategori?.slug && item.slug ? `${localePrefix}/news/${item.kategori.slug}/${item.slug}` : "#";
              const thumbnail = resolveImage(item.images);

              return (
                <div key={item.id} className="flex flex-col border border-slate-200 rounded-lg overflow-hidden group hover:shadow-lg transition bg-white pb-3">
                  <Link href={href} className="w-full h-28 relative block overflow-hidden">
                    {thumbnail ? (
                      <img src={thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <i className="fa-brands fa-bitcoin text-4xl text-slate-300"></i>
                      </div>
                    )}
                  </Link>
                  <div className="px-3 pt-3 flex flex-col flex-grow">
                    <Link href={href} className="block mb-1">
                      <h3 className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-slate-400 font-medium tracking-wide mb-3">Ringkasan pergerakan pasar</p>
                    <Link href={href} className="mt-auto block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded transition-colors shadow-sm">
                      Read More
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
