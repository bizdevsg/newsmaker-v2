"use client";

import React from "react";
import TradingViewWidget from "./TradingViewWidget";

type PolicyQuickDataLiveChartProps = {
  loopItems: any[];
  loopDuration: number;
  chartSymbol: string;
  onSelectSymbol: (symbol: string) => void;
};

export function PolicyQuickDataLiveChart({
  loopItems,
  loopDuration,
  chartSymbol,
  onSelectSymbol,
}: PolicyQuickDataLiveChartProps) {
  return (
    <div className="animate-in fade-in duration-500 w-full overflow-hidden min-w-0">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .live-quote-track-policy {
                animation: live-quote-scroll-policy var(--duration, 16s) linear infinite;
            }

            .live-quote-track-policy:hover {
                animation-play-state: paused;
            }

            @keyframes live-quote-scroll-policy {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
            }
        `,
        }}
      />

      <div className="overflow-hidden mb-6 py-2">
        <div
          className="live-quote-track-policy flex w-max gap-4"
          style={{ ["--duration" as never]: `${loopDuration}s` }}
        >
          {loopItems.map((stat: any, idx: number) => (
            <div
              key={idx}
              onClick={() => onSelectSymbol(stat.tvSymbol)}
              className={`flex-none w-[260px] p-4 flex flex-col justify-center rounded-md border cursor-pointer transition shadow-sm hover:shadow-md ${chartSymbol === stat.tvSymbol ? "bg-blue-50 border-blue-300 ring-1 ring-blue-100" : "bg-white border-slate-200"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {stat.icon ? (
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 ${stat.iconColor}`}
                    >
                      <i className={`${stat.icon} text-lg`}></i>
                    </div>
                  ) : (
                    <div />
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                      {stat.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold tracking-wide uppercase">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div
                    className={`flex items-center gap-1 font-bold text-sm ${stat.isUp ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {stat.value}
                  </div>
                  <div
                    className={`text-xs font-bold mt-1 ${stat.change.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    <i
                      className={`fa-solid ${stat.isUp ? "fa-caret-up" : "fa-caret-down"} mr-1`}
                    ></i>
                    {stat.change}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[400px] border border-slate-200 bg-white rounded-md overflow-hidden p-0 shadow-sm relative group flex items-center justify-center">
        <div className="w-full h-full pb-8">
          <TradingViewWidget symbol={chartSymbol} />
        </div>
      </div>
    </div>
  );
}
