"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type RotatingAdItem = {
  id?: string;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  html?: string;
};

type RotatingAdProps = {
  items: RotatingAdItem[];
  rotationKey?: string;
  slot?: string;
  locale?: string;
  className?: string;
};

const splitHtmlAndCss = (value: string) => {
  const input = String(value ?? "");
  const cssStart = input.match(/(^|\n)\s*\.[\w-]+\s*\{/);

  if (cssStart?.index == null) {
    return { html: input.trim(), css: "" };
  }

  const index = cssStart.index;
  return {
    html: input.slice(0, index).trim(),
    css: input.slice(index).trim(),
  };
};

const extractStyleTags = (value: string) => {
  const input = String(value ?? "");
  const styles: string[] = [];

  const html = input.replace(
    /<style\b[^>]*>([\s\S]*?)<\/style>/gi,
    (_match, css: string) => {
      if (typeof css === "string" && css.trim()) styles.push(css.trim());
      return "";
    },
  );

  return { html: html.trim(), css: styles.join("\n\n").trim() };
};

const splitLeadingCssAndHtml = (value: string) => {
  const input = String(value ?? "");
  const firstTagIndex = input.indexOf("<");

  if (firstTagIndex <= 0) {
    return { css: "", html: input.trim() };
  }

  const leading = input.slice(0, firstTagIndex).trim();
  const trailing = input.slice(firstTagIndex).trim();

  const looksLikeCss = /{[\s\S]*}/.test(leading) && !/<[a-zA-Z]/.test(leading);

  return looksLikeCss
    ? { css: leading, html: trailing }
    : { css: "", html: input.trim() };
};

type SrcDocMeta = {
  title?: string;
  subtitle?: string;
  href?: string;
  ctaLabel?: string;
};

const buildCssOnlyTemplate = (css: string, meta: SrcDocMeta) => {
  const title = meta.title?.trim() || "Sponsored";
  const subtitle = meta.subtitle?.trim() || "";
  const href = meta.href?.trim() || "#";
  const ctaLabel = meta.ctaLabel?.trim() || "Mulai Sekarang";

  if (css.includes(".nm23-modal")) {
    return `
<div class="nm23-modal">
  <div class="nm23-dot d1"></div>
  <div class="nm23-dot d2"></div>
  <div class="nm23-dot d3"></div>
  <div class="nm23-dot d4"></div>

  <div class="nm23-content">
    <div class="nm23-logo">📲</div>
    <span class="nm23-badge">NM23</span>
    <div class="nm23-title">${title}</div>
    ${
      subtitle
        ? `<div class="nm23-desc">${subtitle}</div>`
        : `<div class="nm23-desc">Dapatkan insight & update pasar terbaru.</div>`
    }
    <a href="${href}" class="nm23-btn">${ctaLabel}</a>
  </div>

  <div class="nm23-chart">
    <svg viewBox="0 0 500 100" preserveAspectRatio="none">
      <polyline
        points="0,80 60,60 120,65 180,40 240,45 300,20 360,30 420,10 500,15"
        fill="none"
        stroke="white"
        stroke-width="3"
      />
    </svg>
  </div>
</div>`.trim();
  }

  if (css.includes(".pasar-modal")) {
    return `
<div class="pasar-modal">
  <div class="dot dot1"></div>
  <div class="dot dot2"></div>
  <div class="dot dot3"></div>
  <div class="dot dot4"></div>

  <div class="pasar-content">
    <div class="pasar-icon-wrap">📈</div>
    <span class="pasar-badge">PROMO</span>
    <div class="pasar-title">${title}</div>
    ${
      subtitle
        ? `<div class="pasar-desc">${subtitle}</div>`
        : `<div class="pasar-desc">Dapatkan insight & update pasar terbaru.</div>`
    }
    <a href="${href}" class="pasar-btn">${ctaLabel}</a>
  </div>
</div>`.trim();
  }

  return `
<div style="padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="font-weight:800;margin-bottom:8px">${title}</div>
  ${subtitle ? `<div style="opacity:.8">${subtitle}</div>` : ""}
  <div style="margin-top:12px"><a href="${href}" style="font-weight:700">${ctaLabel}</a></div>
</div>`.trim();
};

const toSrcDoc = (raw: string, frameId: string, meta: SrcDocMeta) => {
  const baseHref =
    typeof window === "undefined" ? "/" : `${window.location.origin}/`;

  const withoutScripts = String(raw ?? "").replace(
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    "",
  );

  const { html: withoutStyleTags, css: cssFromStyleTags } =
    extractStyleTags(withoutScripts);
  const { css: cssLeading, html: htmlInput } =
    splitLeadingCssAndHtml(withoutStyleTags);
  const { html, css } = splitHtmlAndCss(htmlInput);

  const combinedCss = [cssFromStyleTags, cssLeading, css]
    .filter(Boolean)
    .join("\n\n");

  const looksLikeCssOnly =
    !html &&
    Boolean(combinedCss) &&
    !/[<>]/.test(htmlInput) &&
    /{[\s\S]*}/.test(htmlInput);

  const resolvedHtml = looksLikeCssOnly
    ? buildCssOnlyTemplate(combinedCss, meta)
    : html;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <base href="${baseHref}" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: hidden;
      }

      body {
        display: block;
      }

      * {
        box-sizing: border-box;
      }

      img, svg {
        display: block;
        max-width: 100%;
      }

      ${combinedCss ? combinedCss : ""}
    </style>
  </head>
  <body>
    ${resolvedHtml}
    <script>
      (() => {
        try {
          const frameId = ${JSON.stringify(frameId)};

          const getTarget = () => {
            return document.body?.firstElementChild || document.body;
          };

          const getHeight = () => {
            const el = getTarget();
            if (!el) return 0;

            const rect = el.getBoundingClientRect();
            return Math.ceil(rect.height);
          };

          const post = () => {
            const height = getHeight();
            parent.postMessage(
              { type: "ROTATING_AD_HEIGHT", frameId, height },
              "*"
            );
          };

          const observe = () => {
            const el = getTarget();
            if (!el) return;

            const ro = new ResizeObserver(() => post());
            ro.observe(el);
          };

          observe();

          window.addEventListener("load", post);
          window.addEventListener("resize", post);

          requestAnimationFrame(() => post());
          setTimeout(() => post(), 0);
          setTimeout(() => post(), 80);
          setTimeout(() => post(), 200);
        } catch {}
      })();
    </script>
  </body>
</html>`;
};

export function RotatingAd({
  items,
  rotationKey,
  slot = "default",
  locale,
  className = "",
}: RotatingAdProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [htmlHeight, setHtmlHeight] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const reactId = useId();
  const frameId = useMemo(() => `rad-${reactId.replace(/:/g, "")}`, [reactId]);
  const viewKeyRef = useRef<string>("");
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    const length = items.length;
    const viewKey = `${slot}:${rotationKey ?? ""}`;
    const keyChanged = viewKeyRef.current !== viewKey;
    viewKeyRef.current = viewKey;

    if (length === 0) {
      activeIdRef.current = null;
      if (activeIndex !== null) {
        queueMicrotask(() => setActiveIndex(null));
      }
      return;
    }

    if (!keyChanged && activeIdRef.current) {
      const idx = items.findIndex((item) => item.id === activeIdRef.current);
      if (idx >= 0) {
        if (activeIndex !== idx) {
          queueMicrotask(() => setActiveIndex(idx));
        }
        return;
      }
    }

    if (!keyChanged && activeIndex != null && activeIndex >= 0) {
      const current = items[activeIndex];
      if (current) {
        activeIdRef.current = current.id ?? activeIdRef.current;
        return;
      }
    }

    const nextIndex = Math.floor(Math.random() * length);
    const nextItem = items[nextIndex];
    if (!nextItem) {
      activeIdRef.current = null;
      if (activeIndex !== null) {
        queueMicrotask(() => setActiveIndex(null));
      }
      return;
    }

    activeIdRef.current = nextItem.id ?? null;
    if (activeIndex !== nextIndex) {
      queueMicrotask(() => setActiveIndex(nextIndex));
    }
  }, [activeIndex, items, rotationKey, slot]);

  const active = activeIndex == null ? null : (items[activeIndex] ?? null);

  useEffect(() => {
    queueMicrotask(() => setHtmlHeight(0));
  }, [active?.html]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!frameWindow) return;
      if (event.source !== frameWindow) return;

      const data = event.data as unknown;

      if (
        !data ||
        typeof data !== "object" ||
        (data as { type?: unknown }).type !== "ROTATING_AD_HEIGHT" ||
        (data as { frameId?: unknown }).frameId !== frameId
      ) {
        return;
      }

      const height = (data as { height?: unknown }).height;

      if (typeof height === "number" && Number.isFinite(height) && height > 0) {
        setHtmlHeight(Math.max(1, Math.min(Math.ceil(height), 1400)));
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [frameId]);

  const content = (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-100 ${className}`.trim()}
      data-ad-slot={slot}
    >
      <div
        className="pointer-events-none absolute left-2 top-2 z-10 select-none rounded bg-slate-100/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur"
        aria-hidden="true"
      >
        Ads
      </div>
      {active?.html ? (
        <iframe
          ref={iframeRef}
          title={active.imageAlt ?? active.title ?? "Advertisement"}
          srcDoc={toSrcDoc(active.html, frameId, {
            title: active.title,
            subtitle: active.subtitle,
            href: active.href,
            ctaLabel: active.ctaLabel,
          })}
          className="block w-full border-0 align-top"
          style={{
            height: htmlHeight > 0 ? `${htmlHeight}px` : "0px",
          }}
          scrolling="no"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        />
      ) : active?.imageSrc ? (
        <>
          <Image
            src={active.imageSrc}
            alt={active.imageAlt ?? active.title ?? "Advertisement"}
            width={800}
            height={800}
            sizes="(max-width: 1024px) 100vw, 300px"
            className="h-auto w-full object-cover"
            priority={false}
            unoptimized
          />
          {active.title || active.subtitle ? (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent p-4">
              {active.title ? (
                <p className="text-sm font-bold leading-snug text-white">
                  {active.title}
                </p>
              ) : null}
              {active.subtitle ? (
                <p className="mt-1 text-[11px] leading-snug text-slate-100/90">
                  {active.subtitle}
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <div className="grid place-items-center p-4 text-center">
          <div className="space-y-2">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-400">
              <i className="fa-regular fa-rectangle-ad" />
            </div>
            <p className="text-xs font-semibold text-slate-500">
              {active?.title ?? (locale === "en" ? "Ad space" : "Slot iklan")}
            </p>
            {active?.subtitle ? (
              <p className="text-[10px] text-slate-400">{active.subtitle}</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );

  if (active?.href && !active?.html) {
    return (
      <Link
        href={active.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={active.imageAlt ?? active.title ?? "Advertisement"}
      >
        {content}
      </Link>
    );
  }

  return content;
}
