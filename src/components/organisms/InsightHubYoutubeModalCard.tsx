"use client";

import React from "react";
import Image from "next/image";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import type { Locale } from "@/locales";

type InsightHubYoutubeModalCardProps = {
  locale: Locale;
  className: string;
  bgCover?: string;
  imageSrc: string;
  imageAlt: string;
  youtubeEmbedUrl?: string;
  youtubeTitle?: string;
  channels?: { label: string; youtubeEmbedUrl: string }[];
};

const LIVE_TV_SCROLL_LOCK_SOURCE = "insight-hub-youtube-modal";

const cleanText = (value?: string | null) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeYoutubeEmbedUrl = (value?: string | null) => {
  const raw = cleanText(value);
  if (!raw) return "";

  if (!/^https?:\/\//i.test(raw)) {
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
      return `https://www.youtube-nocookie.com/embed/${raw}`;
    }

    return raw;
  }

  try {
    const url = new URL(raw);
    const hostname = url.hostname.replace(/^www\./, "");
    const pathSegments = url.pathname.split("/").filter(Boolean);

    if (hostname === "youtu.be" && pathSegments[0]) {
      return `https://www.youtube-nocookie.com/embed/${pathSegments[0]}`;
    }

    const watchId = url.searchParams.get("v");
    if (pathSegments[0] === "watch" && watchId) {
      return `https://www.youtube-nocookie.com/embed/${watchId}`;
    }

    if (pathSegments[0] === "embed" && pathSegments[1]) {
      return url.toString();
    }

    if (pathSegments[0] === "shorts" && pathSegments[1]) {
      return `https://www.youtube-nocookie.com/embed/${pathSegments[1]}`;
    }

    if (pathSegments[0] === "live" && pathSegments[1]) {
      return `https://www.youtube-nocookie.com/embed/${pathSegments[1]}`;
    }

    if (
      hostname.endsWith("youtube.com") ||
      hostname.endsWith("youtube-nocookie.com")
    ) {
      const embedIdFromPath =
        pathSegments[0] === "embed" ? pathSegments[1] : undefined;
      if (embedIdFromPath) {
        return `https://www.youtube-nocookie.com/embed/${embedIdFromPath}`;
      }
    }

    return raw;
  } catch {
    return raw;
  }
};

const buildYoutubeIframeSrc = (value?: string | null) => {
  const embedUrl = normalizeYoutubeEmbedUrl(value);
  if (!embedUrl) return "";

  if (!/^https?:\/\//i.test(embedUrl)) {
    return embedUrl;
  }

  try {
    const url = new URL(embedUrl);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("rel", "0");
    url.searchParams.set("modestbranding", "1");
    return url.toString();
  } catch {
    return embedUrl;
  }
};

export function InsightHubYoutubeModalCard({
  locale,
  className,
  bgCover,
  imageSrc,
  imageAlt,
  youtubeEmbedUrl,
  youtubeTitle,
  channels,
}: InsightHubYoutubeModalCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeChannelIndex, setActiveChannelIndex] = React.useState(0);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);

  const resolvedTitle =
    cleanText(youtubeTitle) || (locale === "en" ? "Live TV" : "Live TV");

  const resolvedChannels = React.useMemo(() => {
    const normalized =
      channels?.map((channel) => ({
        label: cleanText(channel.label) || resolvedTitle,
        youtubeEmbedUrl: cleanText(channel.youtubeEmbedUrl),
      })) ?? [];

    const filtered = normalized.filter((channel) =>
      Boolean(channel.youtubeEmbedUrl),
    );
    if (filtered.length) return filtered;

    const fallbackUrl = cleanText(youtubeEmbedUrl);
    if (!fallbackUrl) return [];

    return [{ label: resolvedTitle, youtubeEmbedUrl: fallbackUrl }];
  }, [channels, resolvedTitle, youtubeEmbedUrl]);

  const activeChannel = resolvedChannels[activeChannelIndex];

  const iframeSrc = React.useMemo(() => {
    return buildYoutubeIframeSrc(activeChannel?.youtubeEmbedUrl);
  }, [activeChannel?.youtubeEmbedUrl]);

  React.useEffect(() => {
    if (!isOpen) return;

    lockScroll(LIVE_TV_SCROLL_LOCK_SOURCE);
    setActiveChannelIndex(0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlockScroll(LIVE_TV_SCROLL_LOCK_SOURCE);
    };
  }, [closeModal, isOpen]);

  const cardStyle =
    bgCover && bgCover !== "undefined" && bgCover !== "null"
      ? { backgroundImage: `url('${bgCover}')` }
      : undefined;

  return (
    <>
      <button
        type="button"
        className={`${className} w-full cursor-pointer appearance-none bg-transparent p-0 text-left`}
        style={cardStyle}
        aria-label={imageAlt}
        onClick={openModal}
      >
        <div className="relative mx-auto h-[110px] w-full max-w-[340px] sm:h-[120px] md:h-[130px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, 300px"
            className="object-contain p-3 transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={resolvedTitle}
          onClick={closeModal}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-slate-950 shadow-[0_28px_90px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/10"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative flex items-center justify-between gap-3 bg-gradient-to-b from-white/10 to-transparent px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-sm font-semibold tracking-[-0.02em] text-white sm:text-base">
                      {resolvedTitle}
                    </h4>
                    <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-200 ring-1 ring-rose-400/30">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-300" />
                      LIVE
                    </span>
                  </div>
                  <p className="mt-1 hidden text-xs text-slate-200/80 sm:block">
                    {locale === "en"
                      ? "Press Esc to close"
                      : "Tekan Esc untuk menutup"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl leading-none text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 cursor-pointer"
                  aria-label={locale === "en" ? "Close video" : "Tutup video"}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {iframeSrc ? (
                <div className="bg-slate-950">
                  {resolvedChannels.length > 1 ? (
                    <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
                      {resolvedChannels.map((channel, index) => {
                        const isActive = index === activeChannelIndex;
                        return (
                          <button
                            key={`${channel.label}-${index}`}
                            type="button"
                            onClick={() => setActiveChannelIndex(index)}
                            className={[
                              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                              "ring-1 ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                              isActive
                                ? "bg-white/15 text-white ring-white/20"
                                : "bg-white/5 text-slate-200/80 ring-white/10 hover:bg-white/10 hover:text-white",
                            ].join(" ")}
                            aria-pressed={isActive}
                          >
                            {channel.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="aspect-video w-full bg-black">
                    <iframe
                      key={`channel-${activeChannelIndex}`}
                      title={activeChannel?.label || resolvedTitle}
                      src={iframeSrc}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-6 sm:p-8">
                  <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                    <h4 className="text-base font-semibold text-white">
                      {locale === "en"
                        ? "Live TV is not configured yet"
                        : "Live TV belum dikonfigurasi"}
                    </h4>
                    <p className="mt-2 text-sm text-slate-200/80">
                      {locale === "en"
                        ? "Set NEXT_PUBLIC_LIVETV_YOUTUBE_EMBED_URL to a YouTube embed URL (or video ID)."
                        : "Isi NEXT_PUBLIC_LIVETV_YOUTUBE_EMBED_URL dengan URL embed YouTube (atau video ID)."}
                    </p>
                    <div className="mt-4 rounded-xl bg-black/30 px-3 py-2 text-xs text-slate-200/80 ring-1 ring-white/10">
                      <code>NEXT_PUBLIC_LIVETV_YOUTUBE_EMBED_URL=VIDEO_ID</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
