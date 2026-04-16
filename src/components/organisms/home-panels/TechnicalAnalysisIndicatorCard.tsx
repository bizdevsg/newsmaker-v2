import React from "react";
import { Card } from "../../atoms/Card";
import { SectionHeader } from "../../molecules/SectionHeader";

type TechnicalAnalysisIndicatorCardProps = {
  title?: string;
  symbol?: string;
};

const timeframes = ["1 Min", "5 Min", "15 Min", "30 Min", "60 Min"] as const;

export function TechnicalAnalysisIndicatorCard({
  title = "Technical Analysis Indicator",
  symbol = "XAUUSD",
}: TechnicalAnalysisIndicatorCardProps) {
  return (
    <Card className="h-fit">
      <SectionHeader title={title} />
      <div className="p-4">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-600">
            Technical Analysis for{" "}
            <span className="font-bold text-slate-900">{symbol}</span>
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {timeframes.map((label, index) => {
              const active = index === 0;
              return (
                <button
                  key={label}
                  type="button"
                  className={`h-7 rounded-full px-3 text-[11px] font-semibold transition ${
                    active
                      ? "bg-blue-700 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                  aria-pressed={active}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center">
            <div className="relative h-36 w-56">
              <div
                className="absolute inset-0 rounded-b-full rounded-t-[999px]"
                style={{
                  background:
                    "conic-gradient(from 180deg, #ef4444 0deg, #60a5fa 110deg, #22c55e 180deg, #22c55e 360deg)",
                  clipPath: "inset(0 0 50% 0)",
                }}
              />
              <div className="absolute left-1/2 top-[56%] h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm" />
              <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-[11px] font-semibold text-slate-500">
                  Neutral
                </p>
                <p className="mt-1 text-xs font-bold text-slate-900">Buy</p>
              </div>

              <div className="absolute left-2 top-[76%] text-[10px] font-semibold text-rose-600">
                Sell
              </div>
              <div className="absolute left-1/2 top-[20%] -translate-x-1/2 text-[10px] font-semibold text-slate-500">
                Neutral
              </div>
              <div className="absolute right-2 top-[76%] text-[10px] font-semibold text-emerald-600">
                Buy
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
