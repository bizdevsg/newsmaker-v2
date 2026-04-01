"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "../atoms/Card";

const INSTRUMENTS = [
  { label: "Gold (XAUUSD)", name: "Gold Spot / U.S. Dollar", symbol: "OANDA:XAUUSD" },
  { label: "Silver (SILVER)", name: "Silver Spot / U.S. Dollar", symbol: "TVC:SILVER" },
  { label: "BCO (OIL)", name: "Brent Crude Oil", symbol: "TVC:UKOIL" },
  { label: "Index Dollar (DXY)", name: "U.S. Dollar Index", symbol: "TVC:DXY" },
  { label: "Gold Rupiah (XAUIDRG)", name: "Gold / Indonesian Rupiah", symbol: "FX_IDC:XAUIDRG" },
  { label: "Bitcoin (BTCUSD)", name: "Bitcoin / U.S. Dollar", symbol: "BINANCE:BTCUSDT" },
];

function TradingViewTechnicalAnalysis({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: "1m",
      width: "100%",
      isTransparent: true,
      height: "100%",
      symbol: symbol,
      showIntervalTabs: true,
      displayMode: "single",
      locale: "en",
      colorTheme: "light"
    });

    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

function TradingViewSymbolOverview({ symbol, name }: { symbol: string, name: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        [name, `${symbol}|1M`]
      ],
      chartOnly: false,
      width: "100%",
      height: "100%",
      locale: "en",
      colorTheme: "light",
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      maLineColor: "#2962FF",
      maLineWidth: 1,
      maLength: 9,
      lineWidth: 2,
      lineType: 0,
      dateRanges: [
        "1d|1",
        "1m|30",
        "3m|60",
        "1y|1D",
        "5y|1W",
        "all|1M"
      ]
    });

    container.current.appendChild(script);
  }, [symbol, name]);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

export function TechnicalAnalysisArea() {
  const [activeItem, setActiveItem] = useState(INSTRUMENTS[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* Category Chips Container */}
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {INSTRUMENTS.map((item) => {
          const isActive = activeItem.symbol === item.symbol;
          return (
            <button
              key={item.symbol}
              onClick={() => setActiveItem(item)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${isActive
                  ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                  : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Indicators / Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Technical Indicator Gauge (TradingView) */}
        <Card className="flex flex-col bg-white border-slate-200 shadow-sm rounded-lg h-[420px]">
          <TradingViewTechnicalAnalysis symbol={activeItem.symbol} />
        </Card>

        {/* Symbol Overview Chart (TradingView) */}
        <Card className="flex flex-col bg-white border-slate-200 shadow-sm rounded-lg h-[420px]">
          <TradingViewSymbolOverview symbol={activeItem.symbol} name={activeItem.name} />
        </Card>
      </div>
    </div>
  );
}
