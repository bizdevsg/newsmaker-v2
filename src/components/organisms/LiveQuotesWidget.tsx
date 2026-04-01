"use client";

import React, { useEffect, useRef, memo } from "react";

export function LiveQuotesWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "light",
      "dateRange": "12M",
      "showChart": false,
      "locale": "en",
      "largeChartUrl": "",
      "isTransparent": true,
      "showSymbolLogo": true,
      "showFloatingTooltip": false,
      "width": "100%",
      "height": "100%",
      "tabs": [
        {
          "title": "Futures",
          "symbols": [
            { "s": "OANDA:XAUUSD", "d": "XAUUSD" },
            { "s": "OANDA:XAGUSD", "d": "XAGUSD" },
            { "s": "HSI:HSI", "d": "HANGSENG" },
            { "s": "INDEX:NKY", "d": "NIKKEI" },
            { "s": "FOREXCOM:DJI", "d": "DJIA" },
            { "s": "NASDAQ:NDAQ", "d": "NASDAQ" },
            { "s": "OANDA:XAUIDRG", "d": "XAUIDRG" }
          ]
        },
        {
          "title": "Forex",
          "symbols": [
            { "s": "OANDA:AUDUSD" },
            { "s": "OANDA:EURUSD" },
            { "s": "OANDA:GBPUSD" },
            { "s": "OANDA:USDCHF" },
            { "s": "OANDA:USDJPY" },
            { "s": "OANDA:USDIDR" }
          ]
        }
      ]
    });

    container.current.appendChild(script);
  }, []);

  return (
    <div className="flex flex-col h-full rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-blue-800 px-4 py-2 self-start rounded-br-md">
        <h3 className="text-white text-sm font-bold">Live Quotes</h3>
      </div>
      <div className="flex-grow p-2">
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
          <div className="tradingview-widget-container__widget"></div>
        </div>
      </div>
    </div>
  );
}

export default memo(LiveQuotesWidget);
