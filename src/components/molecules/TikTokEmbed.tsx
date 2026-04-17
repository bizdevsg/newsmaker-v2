"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

type TikTokEmbedProps = {
  html: string;
  backupVideoUrl?: string | null;
  forceBackupUrl?: boolean;
  className?: string;
};

declare global {
  interface Window {
    // TikTok embed script attaches itself here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tiktokEmbed?: any;
  }
}

export function TikTokEmbed({
  html,
  backupVideoUrl,
  forceBackupUrl = false,
  className = "",
}: TikTokEmbedProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [renderMode, setRenderMode] = useState<"html" | "iframe" | "video">(() =>
    forceBackupUrl && backupVideoUrl ? "iframe" : "html",
  );

  const isDirectVideoUrl = useMemo(() => {
    if (!backupVideoUrl) return false;
    return /\.(mp4|webm|m3u8)(\?|#|$)/i.test(backupVideoUrl);
  }, [backupVideoUrl]);

  const sanitizedHtml = useMemo(() => {
    // Drop any <script> tags from upstream html so we control loading via next/script.
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<script\b[^>]*\/>/gi, "")
      .trim();
  }, [html]);

  const videoId = useMemo(() => {
    const match =
      sanitizedHtml.match(/data-video-id\s*=\s*"(\d+)"/i) ??
      sanitizedHtml.match(/\/video\/(\d+)/i);
    return match?.[1] ?? "";
  }, [sanitizedHtml]);

  const fallbackVideoId = useMemo(() => {
    if (!backupVideoUrl) return "";
    const match = backupVideoUrl.match(/\/video\/(\d+)/i);
    return match?.[1] ?? "";
  }, [backupVideoUrl]);

  const iframeVideoId = forceBackupUrl ? fallbackVideoId : videoId || fallbackVideoId;

  const iframeSrc = useMemo(() => {
    if (!iframeVideoId) return "";
    const params = new URLSearchParams({
      controls: "0",
      progress_bar: "0",
      play_button: "0",
      volume_control: "0",
      fullscreen_button: "0",
      timestamp: "0",
      loop: "1",
      description: "0",
      music_info: "0",
      rel: "0",
      native_context_menu: "0",
      closed_caption: "0",
    });
    return `https://www.tiktok.com/player/v1/${iframeVideoId}?${params.toString()}`;
  }, [iframeVideoId]);

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setRenderMode(forceBackupUrl && iframeVideoId ? "iframe" : "html");
    }, 0);

    // When the embed html changes, TikTok script usually auto-hydrates
    // on load. If it is already present, attempt a best-effort reparse.
    try {
      window.tiktokEmbed?.load?.();
    } catch {
      // ignore
    }

    const root = rootRef.current;
    if (!root) return;

    const hasIframe = () => Boolean(root.querySelector("iframe"));

    const observer = new MutationObserver(() => {
      if (hasIframe()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });

    const timer = window.setTimeout(() => {
      if (hasIframe()) return;

      if (backupVideoUrl && isDirectVideoUrl) {
        setRenderMode("video");
        return;
      }

      if (iframeVideoId) {
        setRenderMode("iframe");
      }
    }, 1500);

    return () => {
      observer.disconnect();
      window.clearTimeout(resetTimer);
      window.clearTimeout(timer);
    };
  }, [
    sanitizedHtml,
    iframeVideoId,
    backupVideoUrl,
    isDirectVideoUrl,
    forceBackupUrl,
  ]);

  const responsiveClassName = [
    "relative flex h-full w-full min-h-0 min-w-0 overflow-hidden",
    "[&_.tiktok-embed]:!m-0",
    "[&_.tiktok-embed]:!w-full",
    "[&_.tiktok-embed]:!max-w-full",
    "[&_.tiktok-embed]:!min-w-0",
    "[&_.tiktok-embed]:!border-0",
    "[&_.tiktok-embed]:!shadow-none",
    "[&_.tiktok-embed]:!rounded-none",
    "[&_iframe]:block",
    "[&_iframe]:!h-full",
    "[&_iframe]:!w-full",
  ]
    .concat(className ? [className] : [])
    .join(" ")
    .trim();

  return (
    <>
      <Script
        src="https://www.tiktok.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          try {
            window.tiktokEmbed?.load?.();
          } catch {
            // ignore
          }
        }}
      />
      {renderMode === "html" ? (
        <div
          ref={rootRef}
          className={responsiveClassName}
          // Upstream gives prebuilt embed markup.
          // We drop scripts and control hydration via next/script.
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      ) : (
        <div ref={rootRef} className={responsiveClassName}>
          {renderMode === "video" && backupVideoUrl ? (
            <video
              className="h-full w-full flex-1 min-h-0 min-w-0"
              src={backupVideoUrl}
              controls
              playsInline
            />
          ) : renderMode === "iframe" && iframeVideoId ? (
            <iframe
              className="!h-full !w-full flex-1 min-h-0 min-w-0"
              src={iframeSrc}
              scrolling="no"
              frameBorder="0"
              allow="encrypted-media; picture-in-picture"
              allowFullScreen
              title="TikTok video"
            />
          ) : null}
        </div>
      )}
    </>
  );
}
