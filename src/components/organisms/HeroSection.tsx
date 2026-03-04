import React from "react";
import { Button } from "../atoms/Button";
import { Tag } from "../atoms/Tag";
import type { Messages } from "@/locales";

type HeroSectionProps = {
  messages: Messages;
};

export function HeroSection({ messages }: HeroSectionProps) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl uppercase">
          {messages.hero.title}
        </h1>
        <p className="text-base text-slate-500">
          {messages.hero.subtitle}
        </p>
      </div>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-md border border-slate-200 text-white shadow-lg">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/double-exposure-businessman-using-tablet-with-cityscape-financial-graph-blurred-buildi.webp')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-700/75 to-blue-600/60" />
        <div className="relative flex min-h-[220px] flex-col gap-7 p-7 md:flex-row md:items-center">
          <div className="flex-1 space-y-3 max-w-xl">
            <Tag tone="slate" className="bg-white/15 text-white">
              {messages.hero.bannerTag}
            </Tag>
            <h2 className="text-3xl font-semibold">
              {messages.hero.bannerTitle}
            </h2>
            <p className="text-base text-white/80">
              {messages.hero.bannerSubtitle}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-white/60 text-white"
            >
              {messages.hero.bannerCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


