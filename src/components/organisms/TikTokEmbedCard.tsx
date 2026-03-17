"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { SectionHeader } from "../molecules/SectionHeader";
import { useParams } from "next/navigation";

import type { Messages } from "@/locales";

type TikTokEmbedCardProps = {
  locale?: string;
  messages?: Messages;
};

type TikTokItem = {
  id: number;
  title: string;
  embed_code: string;
  backup_video_url?: string | null;
  created_at: string;
  updated_at: string;
};

type TikTokApiResponse = {
  status: number | string;
  message?: string;
  data?: TikTokItem[];
};

type TikTokRenderItem = TikTokItem & {
  fallbackUrl: string;
  playerUrl: string;
};

const extractFallbackUrl = (item: TikTokItem) => {
  const backupUrl = item.backup_video_url?.trim();
  if (backupUrl) return backupUrl;

  const citeMatch = item.embed_code?.match(/cite="([^"]+)"/i);
  return citeMatch?.[1] ?? "";
};

const extractVideoId = (item: TikTokItem) => {
  const dataVideoIdMatch = item.embed_code?.match(/data-video-id="(\d+)"/i);
  if (dataVideoIdMatch?.[1]) return dataVideoIdMatch[1];

  const fallbackUrl = extractFallbackUrl(item);
  const urlVideoIdMatch = fallbackUrl.match(/\/video\/(\d+)/i);
  return urlVideoIdMatch?.[1] ?? "";
};

const buildPlayerUrl = (videoId: string) => {
  if (!videoId) return "";
  const params = new URLSearchParams({
    description: "1",
    controls: "1",
    progress_bar: "1",
    play_button: "1",
    volume_control: "1",
    fullscreen_button: "1",
    timestamp: "1",
    music_info: "1",
    rel: "0",
  });

  return `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`;
};

export function TikTokEmbedCard({
  locale: propLocale,
}: TikTokEmbedCardProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { locale: routeLocale } = useParams<{ locale?: string }>();
  const locale = propLocale || routeLocale;
  const [items, setItems] = useState<TikTokItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const res = await fetch("/api/tiktok?limit=3", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Upstream error: ${res.status}`);
        }
        const json = (await res.json()) as TikTokApiResponse;
        const data = Array.isArray(json?.data) ? json.data : [];
        if (isActive) {
          setItems(data);
        }
      } catch (err) {
        if (!isActive) return;
        const message =
          err instanceof Error ? err.message : "Failed to load TikTok data";
        setErrorMessage(message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const cleanedItems = useMemo<TikTokRenderItem[]>(
    () =>
      items.map((item) => {
        const fallbackUrl = extractFallbackUrl(item);
        const videoId = extractVideoId(item);

        return {
          ...item,
          fallbackUrl,
          playerUrl: buildPlayerUrl(videoId),
        };
      }),
    [items]
  );

  const scrollByCard = (direction: "prev" | "next") => {
    const container = scrollerRef.current;
    if (!container) return;
    const delta = container.clientWidth * (direction === "prev" ? -1 : 1);
    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="rounded-lg bg-white shadow overflow-hidden">
      <SectionHeader
        title={locale === "id" ? "Berita Live" : "Live News"}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard("prev")}
              aria-label="Geser ke kiri"
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard("next")}
              aria-label="Geser ke kanan"
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
            >
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        }
      />
      <div className="p-2">
        <div
          ref={scrollerRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar"
        >
          {isLoading ? (
            <div className="shrink-0 w-full snap-center px-3 py-6 text-sm text-slate-500">
              {locale === "id" ? "Memuat TikTok..." : "Loading TikTok..."}
            </div>
          ) : errorMessage ? (
            <div className="shrink-0 w-full snap-center px-3 py-6 text-sm text-rose-600">
              {errorMessage}
            </div>
          ) : cleanedItems.length === 0 ? (
            <div className="shrink-0 w-full snap-center px-3 py-6 text-sm text-slate-500">
              {locale === "id"
                ? "Belum ada data TikTok."
                : "No TikTok data available."}
            </div>
          ) : (
            cleanedItems.map((item) => (
              <div
                key={item.id}
                data-tiktok-card
                className="shrink-0 w-full snap-center"
              >
                {item.playerUrl ? (
                  <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                    <div className="aspect-[9/16] w-full bg-slate-100">
                      <iframe
                        src={item.playerUrl}
                        title={item.title}
                        className="h-full w-full"
                        allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    </div>
                  </div>
                ) : (
                  <article className="rounded-md border border-slate-200 p-4 text-slate-700">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {locale === "id"
                        ? "Player TikTok tidak bisa dibentuk dari data yang tersedia."
                        : "TikTok player could not be created from the available data."}
                    </p>
                    {item.fallbackUrl ? (
                      <a
                        href={item.fallbackUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        {locale === "id" ? "Buka di TikTok" : "Open on TikTok"}
                        <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                      </a>
                    ) : null}
                  </article>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
