"use client";

import React from "react";
import Image from "next/image";
import { SectionHeader } from "@/components/molecules/SectionHeader";

const toolItems = [
  {
    title: "BiAS 23",
    alt: "Logo BiAS23",
    src: "/assets/Logo_BIAS23.png",
  },
  {
    title: "Newsmaker Artificial Intelegence",
    alt: "Logo NM23 AI",
    src: "/assets/LogoNM23_Ai_22.png",
  },
  {
    title: "Live TV 23",
    alt: "Logo Live TV 23",
    src: "/assets/LIVE_TV23.png",
  },
];

export function ToolsCard() {
  return (
    <div className="bg-white rounded-lg">
      <SectionHeader title="Tools" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-5 py-4">
        {toolItems.map((item) => (
          <div
            key={item.title}
            className="bg-slate-100 hover:bg-slate-200 transition p-4 rounded-md flex items-center gap-3 cursor-pointer"
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={160}
              height={64}
              className="h-auto w-full max-w-15 object-contain"
            />

            <p className="font-semibold text-center">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
