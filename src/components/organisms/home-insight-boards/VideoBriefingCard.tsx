"use client";

import React from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import { IconButton } from "./IconButton";
import type { VideoBriefingItem } from "./fetchLatestVideoBriefing";

type VideoBriefingCardProps = {
  videoBriefingItems: VideoBriefingItem[];
};

const cleanText = (value?: string | null) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeYoutubeEmbedUrl = (value?: string | null) => {
  const raw = cleanText(value);
  if (!raw) return "";

  if (raw.includes("<") || raw.includes(">")) return "";

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
      return `https://www.youtube-nocookie.com/embed/${pathSegments[1]}`;
    }

    if (pathSegments[0] === "shorts" && pathSegments[1]) {
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
    url.searchParams.set("rel", "0");
    url.searchParams.set("modestbranding", "1");
    return url.toString();
  } catch {
    return embedUrl;
  }
};

export function VideoBriefingCard({
  videoBriefingItems,
}: VideoBriefingCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const slides = React.useMemo(
    () => videoBriefingItems.slice(0, 3),
    [videoBriefingItems],
  );

  React.useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  const total = slides.length;
  const hasItems = total > 0;

  const clampIndex = React.useCallback(
    (value: number) => {
      if (!total) return 0;
      return ((value % total) + total) % total;
    },
    [total],
  );

  const goPrev = React.useCallback(() => {
    setActiveIndex((current) => clampIndex(current - 1));
  }, [clampIndex]);

  const goNext = React.useCallback(() => {
    setActiveIndex((current) => clampIndex(current + 1));
  }, [clampIndex]);

  const activeItem = hasItems ? slides[clampIndex(activeIndex)] : null;

  const iframeSrc = buildYoutubeIframeSrc(
    activeItem?.embed_code ?? activeItem?.backup_video_url ?? "",
  );
  const title = cleanText(activeItem?.title) || "Video briefing";
  const image_url =
    cleanText(activeItem?.image_url) ||
    "https://via.placeholder.com/400x250?text=No+Image";
  const backupUrl = cleanText(activeItem?.backup_video_url) || "";

  const modalIframeSrc = React.useMemo(() => {
    if (!iframeSrc || !/^https?:\/\//i.test(iframeSrc)) return iframeSrc;
    try {
      const url = new URL(iframeSrc);
      url.searchParams.set("autoplay", "1");
      url.searchParams.set("rel", "0");
      url.searchParams.set("modestbranding", "1");
      return url.toString();
    } catch {
      return iframeSrc;
    }
  }, [iframeSrc]);

  const openModal = React.useCallback(() => {
    if (!iframeSrc) return;
    setIsOpen(true);
  }, [iframeSrc]);

  const closeModal = React.useCallback(() => setIsOpen(false), []);

  React.useEffect(() => {
    if (!isOpen) return;

    lockScroll("video-briefing-modal");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlockScroll("video-briefing-modal");
    };
  }, [closeModal, isOpen]);

  return (
    <Card className="overflow-hidden">
      <SectionHeader
        title="Video Briefing"
        actions={
          <div className="flex items-center gap-2">
            <IconButton
              label="Previous"
              iconClassName="fa-solid fa-arrow-left text-sm"
              onClick={goPrev}
              disabled={total < 2}
            />
            <IconButton
              label="Next"
              iconClassName="fa-solid fa-arrow-right text-sm"
              onClick={goNext}
              disabled={total < 2}
            />
          </div>
        }
      />
      <div className="p-4">
        <div className="overflow-hidden rounded-xl bg-slate-100">
          <div
            className="flex w-full transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${clampIndex(activeIndex) * 100}%)`,
            }}
          >
            {(slides.length ? slides : [null]).map((item, index) => {
              const slideTitle = cleanText(item?.title) || "Video briefing";
              const slideImageUrl =
                cleanText(item?.image_url) ||
                "https://via.placeholder.com/400x250?text=No+Image";
              const slideIframeSrc = buildYoutubeIframeSrc(
                item?.embed_code ?? item?.backup_video_url ?? "",
              );

              return (
                <div
                  key={String(item?.id ?? `slide-${index}`)}
                  className="w-full shrink-0"
                >
                  <button
                    type="button"
                    onClick={openModal}
                    className="group relative block w-full text-left"
                    aria-label={`Open video briefing: ${slideTitle}`}
                    disabled={!slideIframeSrc}
                  >
                    <div className="aspect-16/10 w-full">
                      <img
                        src={slideImageUrl}
                        alt="Video briefing"
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                      />
                    </div>

                    {slideIframeSrc ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/70 text-white shadow-lg ring-1 ring-white/20 transition group-hover:bg-slate-950/80">
                          <i
                            className="fa-solid fa-play text-sm"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          Video unavailable
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isOpen && modalIframeSrc ? (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={closeModal}
        >
          <div className="flex min-h-full items-center justify-center overflow-y-auto">
            <div
              className="w-full max-w-7xl overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 bg-gradient-to-b from-white/10 to-transparent px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold tracking-[-0.02em] text-white sm:text-base">
                    {title}
                  </h4>
                  <p className="mt-1 hidden text-xs text-slate-200/80 sm:block">
                    Tekan Esc untuk menutup
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl leading-none text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 cursor-pointer"
                  aria-label="Tutup video"
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              </div>

              <div className="aspect-video w-full bg-black">
                <iframe
                  title={title}
                  src={modalIframeSrc}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
