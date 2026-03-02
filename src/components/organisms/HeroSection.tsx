import React from "react";
import { Button } from "../atoms/Button";
import { Tag } from "../atoms/Tag";

export function HeroSection() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl uppercase">
          Indonesia Market
        </h1>
        <p className="text-base text-slate-500">
          Local Market. Institutional Perspective.
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
              Policy Monitor
            </Tag>
            <h2 className="text-3xl font-semibold">
              BI Signals Policy Shift Ahead of Inflation Data
            </h2>
            <p className="text-base text-white/80">
              Regulatory, monetary, and exchange developments shaping
              Indonesia's financial landscape.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-white/60 text-white"
            >
              Read Full Insight
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


