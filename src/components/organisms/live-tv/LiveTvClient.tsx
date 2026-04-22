"use client";

import React from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import type { Locale } from "@/locales";

type LiveTvChannel = {
  label: string;
  youtubeEmbedUrl: string;
};

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

const getLiveTvChannels = (): LiveTvChannel[] => {
  const channels = [
    {
      label: process.env.NEXT_PUBLIC_LIVETV_CHANNEL_1_LABEL ?? "Channel 1",
      youtubeEmbedUrl:
        process.env.NEXT_PUBLIC_LIVETV_CHANNEL_1_URL ??
        process.env.NEXT_PUBLIC_LIVETV_YOUTUBE_EMBED_URL ??
        "",
    },
    {
      label: process.env.NEXT_PUBLIC_LIVETV_CHANNEL_2_LABEL ?? "Channel 2",
      youtubeEmbedUrl: process.env.NEXT_PUBLIC_LIVETV_CHANNEL_2_URL ?? "",
    },
    {
      label: process.env.NEXT_PUBLIC_LIVETV_CHANNEL_3_LABEL ?? "Channel 3",
      youtubeEmbedUrl: process.env.NEXT_PUBLIC_LIVETV_CHANNEL_3_URL ?? "",
    },
  ]
    .map((channel) => ({
      label: cleanText(channel.label) || "Live TV",
      youtubeEmbedUrl: cleanText(channel.youtubeEmbedUrl),
    }))
    .filter((channel) => Boolean(channel.youtubeEmbedUrl));

  return channels;
};

export function LiveTvClient({ locale }: { locale: Locale }) {
  const [activeChannelIndex, setActiveChannelIndex] = React.useState(0);
  const channels = React.useMemo(() => getLiveTvChannels(), []);
  const activeChannel = channels[activeChannelIndex];
  const iframeSrc = React.useMemo(
    () => buildYoutubeIframeSrc(activeChannel?.youtubeEmbedUrl),
    [activeChannel?.youtubeEmbedUrl],
  );

  return (
    <Card className="overflow-hidden">
      <SectionHeader title="Live TV" />

      {iframeSrc ? (
        <div className="p-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 shadow-[0_28px_90px_-24px_rgba(0,0,0,0.45)]">
            <div className="flex gap-3 px-4 py-4 items-center justify-between">
              {channels.length > 1 ? (
                <>
                  <div className="sm:hidden">
                    <label className="grid gap-1">
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                        Channel
                      </span>
                      <select
                        value={String(activeChannelIndex)}
                        onChange={(event) =>
                          setActiveChannelIndex(Number(event.target.value))
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-blue-300"
                      >
                        {channels.map((channel, index) => (
                          <option
                            key={`${channel.label}-${index}`}
                            value={index}
                            className="text-slate-900"
                          >
                            {channel.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="hidden items-center gap-2 overflow-x-auto sm:flex">
                    {channels.map((channel, index) => {
                      const isActive = index === activeChannelIndex;
                      return (
                        <button
                          key={`${channel.label}-${index}`}
                          type="button"
                          onClick={() => setActiveChannelIndex(index)}
                          className={[
                            "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                            isActive
                              ? "bg-white/15 text-white ring-1 ring-white/25"
                              : "bg-white/5 text-slate-200/80 ring-1 ring-white/10 hover:bg-white/10 hover:text-white",
                          ].join(" ")}
                          aria-pressed={isActive}
                        >
                          {channel.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}

              {channels.length ? (
                <div className="inline-flex h-fit w-fit items-center gap-2 rounded-full bg-rose-500/10 px-2.5 py-1 font-semibold text-rose-600">
                  <div className="animate-pulse rounded-full border border-rose-500 p-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  </div>
                  <p className="text-sm">LIVE</p>
                </div>
              ) : undefined}
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                key={`channel-${activeChannelIndex}`}
                title={activeChannel?.label || "Live TV"}
                src={iframeSrc}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                Broadcast Note
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {locale === "en"
                  ? "Live TV streams are provided for market monitoring and general information. Availability and content depend on the configured source."
                  : "Siaran Live TV disediakan untuk pemantauan market dan informasi umum. Ketersediaan dan konten mengikuti sumber yang dikonfigurasi."}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white px-4 py-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">
                Active Channel
              </h3>
              <p className="mt-2 text-lg font-bold tracking-[-0.03em] text-slate-900">
                {activeChannel?.label || "Live TV"}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {locale === "en"
                  ? "Switch channels above to watch another configured stream."
                  : "Pilih channel di atas untuk menonton stream lain yang sudah dikonfigurasi."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="rounded-2xl bg-slate-950 p-6 ring-1 ring-white/10">
            <h4 className="text-base font-semibold text-white">
              {locale === "en"
                ? "Live TV is not configured yet"
                : "Live TV belum dikonfigurasi"}
            </h4>
            <p className="mt-2 text-sm text-slate-200/80">
              {locale === "en"
                ? "Set NEXT_PUBLIC_LIVETV_YOUTUBE_EMBED_URL to a YouTube embed URL or video ID."
                : "Isi NEXT_PUBLIC_LIVETV_YOUTUBE_EMBED_URL dengan URL embed YouTube atau video ID."}
            </p>
            <div className="mt-4 rounded-xl bg-black/30 px-3 py-2 text-xs text-slate-200/80 ring-1 ring-white/10">
              <code>NEXT_PUBLIC_LIVETV_YOUTUBE_EMBED_URL=VIDEO_ID</code>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
