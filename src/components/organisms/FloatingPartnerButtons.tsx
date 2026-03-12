"use client";

import React from "react";
import Image from "next/image";

const partnerButtons = [
  {
    href: "https://bias23.com",
    src: "/assets/Logo_BIAS23.png",
    alt: "BIAS23",
  },
  {
    href: "https://gwenstacy.newsmaker.id",
    src: "/assets/LogoNM23_Ai_22.png",
    alt: "NM23 AI",
  },
  {
    href: "/live-tv",
    src: "/assets/LIVE_TV23.png",
    alt: "Live TV",
  },
];

export function FloatingPartnerButtons() {
  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2">
      {partnerButtons.map((item) => (
        <a
          key={item.alt}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.alt}
          className="group inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Image
            src={item.src}
            alt={item.alt}
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
            priority={false}
          />
        </a>
      ))}
    </div>
  );
}
