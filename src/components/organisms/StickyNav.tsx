"use client";

import React from "react";

type StickyNavProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Sticky header wrapper. On desktop the element that carries
 * `data-header-collapsible` (the logo row) scrolls away with the page, while
 * everything after it (nav links, ticker) stays pinned. This is done by
 * offsetting `top` by the collapsible row's height. On mobile the hamburger
 * lives in that row, so the whole header stays pinned.
 */
export function StickyNav({ children, className = "" }: StickyNavProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const target = root.querySelector<HTMLElement>("[data-header-collapsible]");
    if (!target) return;

    const sync = () => {
      root.style.setProperty("--nm-collapse", `${target.offsetHeight}px`);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`sticky top-0 z-50 transition-shadow md:[top:calc(var(--nm-collapse,0px)*-1)] ${
        isScrolled ? "shadow-lg" : "shadow-none"
      } ${className}`}
    >
      {children}
    </div>
  );
}
