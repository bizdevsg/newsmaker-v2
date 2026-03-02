"use client";

import React from "react";

type StickyNavProps = {
  children: React.ReactNode;
  className?: string;
};

export function StickyNav({ children, className = "" }: StickyNavProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-50 transition-shadow ${
        isScrolled ? "shadow-lg" : "shadow-none"
      } ${className}`}
    >
      {children}
    </div>
  );
}
