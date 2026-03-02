import React from "react";

const ticks = [
  "IHSG 7,150 +0.68%",
  "USD 15,680 +0.04%",
  "Gold 1,254,000 +0.32%",
  "Oil 83.20 -0.15%",
];

export function TickerBar() {
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
