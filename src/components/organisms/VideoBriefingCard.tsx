"use client";

import React, { useState, useEffect } from "react";
import { SectionHeader } from "../molecules/SectionHeader";
import { useParams } from "next/navigation";

// Base URL & Token from environment
const NEWS_API = process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ?? "";
const NEWS_TOKEN = process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ?? "";

type VideoItem = {
  id: number;
  title?: string;
  slug?: string;
  updated_at?: string;
  created_at?: string;
  kategori?: { name?: string; slug?: string; };
  images?: string[];
  video_url?: string; // Assume API might return a video_url or we fallback
};

export function VideoBriefingCard() {
  const { locale } = useParams<{ locale?: string }>();
  const [items, setItems] = useState<VideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageBase, setImageBase] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const fetchVideos = async () => {
      try {
        if (!NEWS_API) {
           setIsLoading(false);
           return;
        }
        const res = await fetch(NEWS_API, {
           headers: { Authorization: `Bearer ${NEWS_TOKEN}` }
        });
        const json = await res.json();
        if (!isActive || !json?.data) return;
        
        const data: VideoItem[] = Array.isArray(json.data) ? json.data : [];
        const base = process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE ?? "";
        if (base) setImageBase(base);

        // Filter objects where category slug/name matches 'video' or 'briefing'
        const keywords = ["video", "briefing"];
        const filtered = data.filter((item) => {
           const catSlug = (item.kategori?.slug ?? "").toLowerCase();
           const catName = (item.kategori?.name ?? "").toLowerCase();
           return keywords.some(kw => catSlug.includes(kw) || catName.includes(kw));
        });

        filtered.sort((a, b) => {
            return (Date.parse(b.updated_at ?? b.created_at ?? "") || 0) - (Date.parse(a.updated_at ?? a.created_at ?? "") || 0);
        });

        // If filtering results in nothing, fallback to first 3 items of data as a test dummy "API ready"
        const finalItems = filtered.length > 0 ? filtered.slice(0, 5) : data.slice(0, 5);
        setItems(finalItems);
      } catch (err) {
         console.error(err);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    fetchVideos();
    return () => { isActive = false; };
  }, []);

  const handleNext = () => {
     if (items.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % items.length);
     }
  };

  const handlePrev = () => {
     if (items.length > 0) {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
     }
  };

  const resolveImage = (images?: string[]) => {
      if (!images || images.length === 0) return null;
      const first = images[0] ?? "";
      if (!first) return null;
      const prefix = first.startsWith("/") ? "" : "/";
      return imageBase + prefix + first;
  };

  const currentItem = items[currentIndex];
  const thumbnail = currentItem ? resolveImage(currentItem.images) : null;
  
  const formatDate = (dateStr?: string) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === "en" ? "en-GB" : "id-ID", { month: 'short', year: 'numeric' }).toUpperCase();
  };

  return (
    <section className="rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <SectionHeader
        title={locale === "id" ? "Video Briefing" : "Video Briefing"}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              type="button"
              aria-label="Geser ke kiri"
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={isLoading || items.length <= 1}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button
              onClick={handleNext}
              type="button"
              aria-label="Geser ke kanan"
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={isLoading || items.length <= 1}
            >
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        }
      />
      
      <div className="p-4 flex-grow flex flex-col">
        {isLoading ? (
           <div className="flex-grow min-h-[260px] bg-slate-100 animate-pulse rounded-lg"></div>
        ) : !currentItem ? (
           <div className="flex-grow min-h-[260px] bg-slate-50 flex items-center justify-center rounded-lg border border-slate-100">
               <span className="text-slate-400 text-sm font-semibold">No video briefings available</span>
           </div>
        ) : (
           <div 
             key={currentItem.id} 
             className="relative flex-grow min-h-[260px] bg-black/80 group cursor-pointer overflow-hidden flex flex-col justify-center items-center rounded-lg shadow-inner animate-in fade-in duration-500"
           >
             <img 
                 src={thumbnail || "https://archive.org/download/placeholder-image/placeholder-image.jpg"} 
                 alt={currentItem.title || "Video thumbnail"} 
                 className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" 
             />
             <div className="relative z-10 h-16 w-16 rounded-full bg-blue-600/95 text-white flex items-center justify-center border-4 border-white/20 shadow-[0_0_40px_rgba(37,99,235,0.8)] group-hover:bg-blue-500 group-hover:scale-110 transition duration-500">
                 <i className="fa-solid fa-play text-2xl ml-1"></i>
             </div>
             <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent">
                 <h4 className="text-sm font-black text-white line-clamp-2 leading-tight drop-shadow-md">
                   {currentItem.title}
                 </h4>
                 <div className="mt-2 flex items-center gap-2">
                   <span className="text-[10px] font-black text-blue-400">
                     {(currentItem.kategori?.name || "MARKET ANALYSIS").toUpperCase()}
                   </span>
                   <span className="text-white/30">•</span>
                   <span className="text-[10px] font-bold text-white/70">
                     {formatDate(currentItem.updated_at || currentItem.created_at)}
                   </span>
                 </div>
             </div>
           </div>
        )}
      </div>
    </section>
  );
}
