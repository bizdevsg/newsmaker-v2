import React from "react";

type TickerBarProps = {
  ticks: string[];
};

export function TickerBar({ ticks }: TickerBarProps) {
  const tickStream = [...ticks, ...ticks, ...ticks];
  return (
    <div className="overflow-hidden rounded-md bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 shadow-lg">
      <div className="ticker-track">
        <div className="ticker-row">
          {tickStream.map((tick, index) => (
            <span key={`${tick}-${index}`}>{tick}</span>
          ))}
        </div>
        <div className="ticker-row" aria-hidden="true">
          {tickStream.map((tick, index) => (
            <span key={`${tick}-dup-${index}`}>{tick}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
