"use client";

import React, { useEffect, useRef } from "react";
import { SectionHeader } from "../molecules/SectionHeader";
import { useParams } from "next/navigation";

import type { Messages } from "@/locales";

type TikTokEmbedCardProps = {
  locale?: string;
  messages?: Messages;
};

const TIKTOK_VIDEOS = [
  {
    id: "7613822506943778069",
    url: "https://www.tiktok.com/@newsmaker23_talk/video/7613822506943778069",
    authorUrl: "https://www.tiktok.com/@newsmaker23_talk?refer=embed",
    authorLabel: "@newsmaker23_talk",
  },
  {
    id: "7613719361060130069",
    url: "https://www.tiktok.com/@newsmaker23_talk/video/7613719361060130069",
    authorUrl: "https://www.tiktok.com/@newsmaker23_talk?refer=embed",
    authorLabel: "@newsmaker23_talk",
  },
];

export function TikTokEmbedCard({ locale: propLocale, messages }: TikTokEmbedCardProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { locale: routeLocale } = useParams<{ locale?: string }>();
  const locale = propLocale || routeLocale;

  useEffect(() => {
    if (
      document.querySelector('script[src="https://www.tiktok.com/embed.js"]')
    ) {
      const global = window as Window & {
        tiktokEmbed?: { load?: () => void };
      };
      global.tiktokEmbed?.load?.();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    script.onload = () => {
      const global = window as Window & {
        tiktokEmbed?: { load?: () => void };
      };
      global.tiktokEmbed?.load?.();
    };
    document.body.appendChild(script);
  }, []);

  const scrollByCard = (direction: "prev" | "next") => {
    const container = scrollerRef.current;
    if (!container) return;
    const delta = container.clientWidth * (direction === "prev" ? -1 : 1);
    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="rounded-lg bg-white shadow overflow-hidden">
      <SectionHeader
        title={locale === "id" ? "Video di Tiktok" : "Video on Tiktok"}
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
          {TIKTOK_VIDEOS.map((video) => (
            <div
              key={video.id}
              data-tiktok-card
              className="shrink-0 w-full snap-center"
            >
              <blockquote
                className="tiktok-embed"
                cite={video.url}
                data-video-id={video.id}
                style={{ maxWidth: "605px", minWidth: "325px" }}
              >
                <section>
                  <a
                    target="_blank"
                    title={video.authorLabel}
                    href={video.authorUrl}
                    rel="noreferrer"
                  >
                    {video.authorLabel}
                  </a>{" "}
                  <a target="_blank" href={video.url} rel="noreferrer">
                    Open video
                  </a>
                </section>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
