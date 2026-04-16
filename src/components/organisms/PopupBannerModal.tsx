"use client";

import React from "react";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import { resolvePortalNewsImageSrc } from "@/lib/portalnews-image-proxy";
import { useLoading } from "../providers/LoadingProvider";

type PopupBannerItem = {
  id?: number;
  title?: string;
  description?: string | null;
  image?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  modal_html?: string | null;
  has_custom_html?: boolean;
};

type PopupBannerResponse = {
  status?: string;
  data?: PopupBannerItem[];
};

type ParsedPopupContent = {
  ctaHref?: string;
  ctaImageAlt?: string;
  ctaImageSrc?: string;
  ctaLabel?: string;
  descriptionLines: string[];
  logoAlt?: string;
  logoSrc?: string;
  title: string;
};

type SanitizedPopupHtml = {
  bodyHtml: string;
  styleHtml: string;
};

const POPUP_SCROLL_LOCK_SOURCE = "popup-banner-modal";
const DEFAULT_IFRAME_HEIGHT = 420;

const cleanText = (value?: string | null) =>
  String(value ?? "").replace(/\s+/g, " ").trim();

const pickRandomBanner = (items: PopupBannerItem[]) => {
  if (!items.length) return null;

  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex] ?? null;
};

const normalizeHref = (value?: string | null) => {
  const normalizedValue = cleanText(value);
  if (!normalizedValue) return undefined;
  return normalizedValue;
};

const toSafeUrl = (value?: string | null) => {
  const normalizedValue = normalizeHref(value);
  if (!normalizedValue) return undefined;
  if (/^\s*javascript:/i.test(normalizedValue)) return undefined;
  return resolvePortalNewsImageSrc(normalizedValue) ?? undefined;
};

const isExternalUrl = (value?: string) =>
  Boolean(value && /^https?:\/\//i.test(value));

const getUniqueTextLines = (values: string[]) =>
  values.filter((value, index, lines) => {
    if (!value) return false;
    return lines.indexOf(value) === index;
  });

const CLOSE_GLYPHS = new Set(["\u00D7", "x", "\u2715", "\u2716"]);

const isCloseLikeElement = (node: Element) => {
  const className = (node.getAttribute("class") ?? "").toLowerCase();
  const id = (node.getAttribute("id") ?? "").toLowerCase();
  const ariaLabel = cleanText(node.getAttribute("aria-label")).toLowerCase();
  const dataDismiss = cleanText(node.getAttribute("data-dismiss")).toLowerCase();
  const text = cleanText(node.textContent).toLowerCase();

  if (className.includes("close") || id.includes("close")) return true;
  if (ariaLabel.includes("close") || ariaLabel.includes("tutup")) return true;
  if (dataDismiss.includes("close") || dataDismiss.includes("modal")) return true;
  if (CLOSE_GLYPHS.has(text)) return true;

  return false;
};

const sanitizePopupHtml = (value?: string | null): SanitizedPopupHtml => {
  if (!value || typeof DOMParser === "undefined") {
    return {
      bodyHtml: "",
      styleHtml: "",
    };
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(value, "text/html");

  documentNode
    .querySelectorAll("script, iframe, object, embed, meta, link")
    .forEach((node) => node.remove());

  documentNode.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();
      const attributeValue = attribute.value;

      if (attributeName.startsWith("on")) {
        node.removeAttribute(attribute.name);
        return;
      }

      if (
        (attributeName === "href" || attributeName === "src") &&
        /^\s*javascript:/i.test(attributeValue)
      ) {
        node.removeAttribute(attribute.name);
      }
    });
  });

  const closeLikeElements = Array.from(
    documentNode.querySelectorAll("button, a, [role='button']"),
  ).filter(isCloseLikeElement);

  if (closeLikeElements.length) {
    closeLikeElements.forEach((element) => {
      element.setAttribute("data-popup-close", "true");
      if (element.tagName.toLowerCase() === "button") {
        element.setAttribute("type", "button");
      }
    });
  } else {
    const firstButton = documentNode.querySelector("button");
    if (firstButton) {
      firstButton.setAttribute("data-popup-close", "true");
      firstButton.setAttribute("type", "button");
    }
  }

  documentNode.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";

    if (href === "#") {
      anchor.setAttribute("data-popup-noop", "true");
      return;
    }

    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
  });

  return {
    bodyHtml: documentNode.body.innerHTML.trim(),
    styleHtml: Array.from(documentNode.head.querySelectorAll("style"))
      .map((node) => node.outerHTML)
      .join("\n"),
  };
};

const buildPopupIframeSrcDoc = (
  bodyHtml: string,
  styleHtml: string,
  frameId: string,
) => {
  const serializedFrameId = JSON.stringify(frameId);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
      }

      [data-popup-root] {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        background: transparent;
      }
    </style>
    ${styleHtml}
  </head>
  <body>
    <div data-popup-root>${bodyHtml}</div>
    <script>
      const FRAME_ID = ${serializedFrameId};

      const postMessageToParent = (payload) => {
        window.parent.postMessage({ frameId: FRAME_ID, ...payload }, "*");
      };

      const postHeight = () => {
        const bodyHeight = document.body ? document.body.scrollHeight : 0;
        const docHeight = document.documentElement ? document.documentElement.scrollHeight : 0;
        const root = document.querySelector("[data-popup-root]");
        const rootHeight = root ? root.scrollHeight : 0;
        const nextHeight = Math.max(bodyHeight, docHeight, rootHeight, 1);

        postMessageToParent({
          type: "popup-banner-resize",
          height: Math.ceil(nextHeight)
        });
      };

      const scheduleHeightSync = () => {
        window.requestAnimationFrame(postHeight);
      };

      const postReady = () => {
        window.requestAnimationFrame(() => {
          postMessageToParent({ type: "popup-banner-ready" });
        });
      };

      window.addEventListener("load", () => {
        scheduleHeightSync();
        postReady();
      });
      window.addEventListener("resize", scheduleHeightSync);
      window.setTimeout(scheduleHeightSync, 60);
      window.setTimeout(scheduleHeightSync, 300);
      window.setTimeout(scheduleHeightSync, 1000);

      if (typeof ResizeObserver !== "undefined") {
        const resizeObserver = new ResizeObserver(scheduleHeightSync);
        resizeObserver.observe(document.body);
      }

      if (typeof MutationObserver !== "undefined") {
        const mutationObserver = new MutationObserver(scheduleHeightSync);
        mutationObserver.observe(document.body, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
        });
      }

      Array.from(document.images || []).forEach((image) => {
        if (!image.complete) {
          image.addEventListener("load", scheduleHeightSync, { once: true });
          image.addEventListener("error", scheduleHeightSync, { once: true });
        }
      });

      document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
          return;
        }

        const CLOSE_GLYPHS = new Set(["\u00D7", "x", "\u2715", "\u2716"]);

        const isCloseLikeElement = (element) => {
          const className = (element.getAttribute("class") || "").toLowerCase();
          const id = (element.getAttribute("id") || "").toLowerCase();
          const ariaLabel = (element.getAttribute("aria-label") || "").trim().toLowerCase();
          const dataDismiss = (element.getAttribute("data-dismiss") || "").trim().toLowerCase();
          const text = (element.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();

          return (
            element.matches("[data-popup-close='true']") ||
            className.includes("close") ||
            id.includes("close") ||
            ariaLabel.includes("close") ||
            ariaLabel.includes("tutup") ||
            dataDismiss.includes("close") ||
            dataDismiss.includes("modal") ||
            CLOSE_GLYPHS.has(text)
          );
        };

        const getCloseElements = () =>
          Array.from(
            document.querySelectorAll(
              "[data-popup-close='true'], button, a, [role='button']",
            ),
          ).filter(isCloseLikeElement);

        const closeCandidate = target.closest(
          "[data-popup-close='true'], button, a, [role='button']",
        );

        if (closeCandidate && isCloseLikeElement(closeCandidate)) {
          event.preventDefault();
          postMessageToParent({ type: "popup-banner-close" });
          return;
        }

        // Fallback: pseudo-elements or overlays can steal click target from the close button.
        if (event instanceof MouseEvent) {
          const { clientX, clientY } = event;
          const matchingCloseElement = getCloseElements().find((element) => {
            const rect = element.getBoundingClientRect();
            return (
              clientX >= rect.left &&
              clientX <= rect.right &&
              clientY >= rect.top &&
              clientY <= rect.bottom
            );
          });

          if (matchingCloseElement) {
            event.preventDefault();
            postMessageToParent({ type: "popup-banner-close" });
            return;
          }
        }

        if (target.closest("a[data-popup-noop='true']")) {
          event.preventDefault();
        }
      });
    </script>
  </body>
</html>`;
};

const parsePopupContent = (banner: PopupBannerItem): ParsedPopupContent => {
  const fallbackTitle = cleanText(banner.title) || "Latest Update";
  const fallbackDescription = cleanText(banner.description);
  const fallbackDescriptionLines = fallbackDescription
    ? [fallbackDescription]
    : [];

  const content: ParsedPopupContent = {
    title: fallbackTitle,
    descriptionLines: fallbackDescriptionLines,
    logoSrc: toSafeUrl(banner.image_url ?? banner.image),
    ctaHref: normalizeHref(banner.cta_url),
    ctaLabel: cleanText(banner.cta_label),
  };

  if (!banner.modal_html || typeof DOMParser === "undefined") {
    return content;
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(banner.modal_html, "text/html");
  documentNode
    .querySelectorAll("script, iframe, object, embed, style, meta, link")
    .forEach((node) => node.remove());

  const heading = documentNode.querySelector("h1, h2, h3");
  const paragraphLines = getUniqueTextLines(
    Array.from(documentNode.querySelectorAll("p"))
      .map((node) => cleanText(node.textContent))
      .filter(Boolean),
  );
  const anchors = Array.from(documentNode.querySelectorAll("a[href]"));
  const ctaAnchor =
    anchors.find((anchor) => anchor.querySelector("img")) ?? anchors[0];
  const ctaImage = ctaAnchor?.querySelector("img");
  const images = Array.from(documentNode.querySelectorAll("img"));
  const logoImage =
    images.find((image) => image !== ctaImage && !ctaAnchor?.contains(image)) ??
    images[0];

  return {
    title: cleanText(heading?.textContent) || fallbackTitle,
    descriptionLines:
      paragraphLines.length > 0 ? paragraphLines : fallbackDescriptionLines,
    logoSrc: content.logoSrc || toSafeUrl(logoImage?.getAttribute("src")),
    logoAlt: cleanText(logoImage?.getAttribute("alt")) || fallbackTitle,
    ctaHref: content.ctaHref || normalizeHref(ctaAnchor?.getAttribute("href")),
    ctaLabel:
      content.ctaLabel || cleanText(ctaAnchor?.textContent) || undefined,
    ctaImageSrc: toSafeUrl(ctaImage?.getAttribute("src")),
    ctaImageAlt:
      cleanText(ctaImage?.getAttribute("alt")) ||
      cleanText(ctaAnchor?.textContent) ||
      undefined,
  };
};

const PopupBannerAction = ({
  href,
  imageAlt,
  imageSrc,
  label,
}: {
  href?: string;
  imageAlt?: string;
  imageSrc?: string;
  label?: string;
}) => {
  const hasLink = Boolean(href && href !== "#");
  const linkTarget = isExternalUrl(href) ? "_blank" : undefined;
  const linkRel = isExternalUrl(href) ? "noopener noreferrer" : undefined;

  if (imageSrc) {
    const imageElement = (
      <img
        src={imageSrc}
        alt={imageAlt || label || "Call to action"}
        className="h-14 w-auto max-w-full transition duration-200 hover:scale-[1.03]"
      />
    );

    if (!hasLink) {
      return <div className="inline-flex justify-center">{imageElement}</div>;
    }

    return (
      <a
        href={href}
        target={linkTarget}
        rel={linkRel}
        className="inline-flex justify-center"
      >
        {imageElement}
      </a>
    );
  }

  if (!hasLink) {
    return null;
  }

  return (
    <a
      href={href}
      target={linkTarget}
      rel={linkRel}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1061B3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0D4F92]"
    >
      {label || "Learn More"}
    </a>
  );
};

export function PopupBannerModal() {
  const { start, stop } = useLoading();
  const [banner, setBanner] = React.useState<PopupBannerItem | null>(null);
  const [iframeHeight, setIframeHeight] = React.useState(DEFAULT_IFRAME_HEIGHT);
  const customIframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const loadingTokenRef = React.useRef<symbol | null>(null);
  const loadingSettledRef = React.useRef(false);
  const frameId = React.useId().replace(/:/g, "");
  const isOpen = banner !== null;
  const closeModal = React.useCallback(() => {
    setBanner(null);
  }, []);
  const finishLoading = React.useCallback(() => {
    if (loadingSettledRef.current) {
      return;
    }

    loadingSettledRef.current = true;

    if (loadingTokenRef.current) {
      stop(loadingTokenRef.current);
      loadingTokenRef.current = null;
    }
  }, [stop]);

  React.useEffect(() => {
    loadingSettledRef.current = false;
    loadingTokenRef.current = start("popup-banner");

    const controller = new AbortController();

    const loadBanner = async () => {
      try {
        const response = await fetch("/api/popup-banner", {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => null)) as
          | PopupBannerResponse
          | null;

        if (!response.ok) {
          finishLoading();
          return;
        }

        const bannerItems = Array.isArray(payload?.data)
          ? payload.data.filter(
              (item): item is PopupBannerItem => item !== null && item !== undefined,
            )
          : [];

        if (!bannerItems.length) {
          finishLoading();
          return;
        }

        setBanner(pickRandomBanner(bannerItems));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        finishLoading();
      }
    };

    loadBanner();

    return () => {
      controller.abort();
      finishLoading();
    };
  }, [finishLoading, start]);

  React.useEffect(() => {
    if (!isOpen) {
      unlockScroll(POPUP_SCROLL_LOCK_SOURCE);
      return;
    }

    lockScroll(POPUP_SCROLL_LOCK_SOURCE);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      unlockScroll(POPUP_SCROLL_LOCK_SOURCE);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeModal, isOpen]);

  const content = React.useMemo(
    () => (banner ? parsePopupContent(banner) : null),
    [banner],
  );

  const customHtml = React.useMemo(
    () => sanitizePopupHtml(banner?.has_custom_html ? banner.modal_html : null),
    [banner],
  );

  const customHtmlSrcDoc = React.useMemo(
    () =>
      customHtml.bodyHtml
        ? buildPopupIframeSrcDoc(
            customHtml.bodyHtml,
            customHtml.styleHtml,
            frameId,
          )
        : "",
    [customHtml, frameId],
  );

  React.useEffect(() => {
    if (!banner || customHtml.bodyHtml) {
      return undefined;
    }

    const assetUrls = [content?.logoSrc, content?.ctaImageSrc].filter(
      (value): value is string => Boolean(value),
    );

    let animationFrameId: number | null = null;
    let canceled = false;

    const markReady = () => {
      if (canceled) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        finishLoading();
      });
    };

    if (!assetUrls.length) {
      markReady();

      return () => {
        canceled = true;
        if (animationFrameId !== null) {
          window.cancelAnimationFrame(animationFrameId);
        }
      };
    }

    let settledCount = 0;
    const imageLoaders = assetUrls.map((url) => {
      const image = new window.Image();
      let resolved = false;

      const settle = () => {
        if (resolved) {
          return;
        }

        resolved = true;
        settledCount += 1;

        if (settledCount >= assetUrls.length) {
          markReady();
        }
      };

      image.onload = settle;
      image.onerror = settle;
      image.src = url;

      if (image.complete) {
        settle();
      }

      return image;
    });

    return () => {
      canceled = true;

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      imageLoaders.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [banner, content, customHtml.bodyHtml, finishLoading]);

  React.useEffect(() => {
    if (!isOpen || !customHtml.bodyHtml) {
      return undefined;
    }

    setIframeHeight(DEFAULT_IFRAME_HEIGHT);

    const onMessage = (event: MessageEvent) => {
      if (event.source !== customIframeRef.current?.contentWindow) {
        return;
      }

      const payload = event.data;
      if (!payload || typeof payload !== "object" || payload.frameId !== frameId) {
        return;
      }

      if (payload.type === "popup-banner-close") {
        closeModal();
        return;
      }

      if (payload.type === "popup-banner-ready") {
        finishLoading();
        return;
      }

      if (
        payload.type === "popup-banner-resize" &&
        typeof payload.height === "number" &&
        Number.isFinite(payload.height)
      ) {
        setIframeHeight(Math.max(Math.ceil(payload.height), 1));
      }
    };

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [closeModal, customHtml, finishLoading, frameId, isOpen]);

  if (!banner || !isOpen) {
    return null;
  }

  if (customHtml.bodyHtml) {
    return (
      <div
        className="fixed inset-0 z-[120] bg-slate-950/70 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={banner.title || "Popup Banner"}
        onClick={closeModal}
      >
        <div className="flex min-h-full items-center justify-center overflow-y-auto">
          <div className="w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
            <iframe
              ref={customIframeRef}
              title={banner.title || "Popup Banner"}
              srcDoc={customHtmlSrcDoc}
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
              scrolling="no"
              className="block w-full border-0 bg-transparent"
              style={{ height: `${iframeHeight}px` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-banner-title"
      onClick={closeModal}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 text-xl leading-none text-white transition hover:bg-slate-900"
            aria-label="Close popup"
          >
            &times;
          </button>

          <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:p-8">
            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
              {content.logoSrc ? (
                <div className="mb-5 flex justify-center">
                  <div className="overflow-hidden rounded-[24px] bg-slate-100 shadow-xl ring-1 ring-slate-200/80">
                    <img
                      src={content.logoSrc}
                      alt={content.logoAlt || content.title}
                      className="h-40 w-auto max-w-full object-cover object-center sm:h-44"
                    />
                  </div>
                </div>
              ) : null}

              <h2
                id="popup-banner-title"
                className="mb-3 text-2xl font-bold tracking-[-0.03em] text-slate-900"
              >
                {content.title}
              </h2>

              {content.descriptionLines.length ? (
                <div className="mb-6 space-y-2 text-sm leading-relaxed text-slate-600">
                  {content.descriptionLines.map((line, index) => (
                    <p key={`${line}-${index}`}>{line}</p>
                  ))}
                </div>
              ) : null}

              <div className="flex w-full flex-col items-center gap-3">
                <PopupBannerAction
                  href={content.ctaHref}
                  imageAlt={content.ctaImageAlt}
                  imageSrc={content.ctaImageSrc}
                  label={content.ctaLabel}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


