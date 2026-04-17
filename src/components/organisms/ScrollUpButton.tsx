"use client";

import React from "react";

export function ScrollUpButton() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      className={`fixed bottom-4 md:bottom-4 right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white shadow-lg transition sm:bottom-8 sm:right-6 animate-bounce cursor-pointer ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 translate-y-2"
      } hover:bg-blue-700`}
    >
      <span className="text-lg leading-none">
        <i className="fa-solid fa-angles-up"></i>
      </span>
    </button>
  );
}
