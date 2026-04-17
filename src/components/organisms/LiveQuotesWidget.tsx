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
            { "s": "OANDA:XAUUSD", "d": "Gold Spot" },
            { "s": "OANDA:XAGUSD", "d": "Silver Spot" },
            { "s": "TVC:UKOIL", "d": "Brent Crude" },
            { "s": "TVC:USOIL", "d": "WTI Oil" },
            { "s": "HSI:HSI", "d": "Hang Seng" },
            { "s": "INDEX:NKY", "d": "Nikkei 225" },
            { "s": "FOREXCOM:DJI", "d": "DJIA" },
            { "s": "NASDAQ:NDAQ", "d": "Nasdaq" },
            { "s": "TVC:SPX", "d": "S&P 500" },
            { "s": "FOREXCOM:DAX", "d": "DAX 40" },
            { "s": "FX_IDC:XAUIDRG", "d": "Gold IDR" },
            { "s": "TVC:DXY", "d": "US Dollar Index" }
          ]
        },
        {
          "title": "Forex",
          "symbols": [
            { "s": "OANDA:EURUSD" },
            { "s": "OANDA:GBPUSD" },
            { "s": "OANDA:USDJPY" },
            { "s": "OANDA:AUDUSD" },
            { "s": "OANDA:USDCHF" },
            { "s": "OANDA:USDCAD" },
            { "s": "OANDA:NZDUSD" },
            { "s": "OANDA:EURGBP" },
            { "s": "OANDA:EURJPY" },
            { "s": "FX_IDC:USDIDR", "d": "USD/IDR" }
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
      <div className="flex-1 min-h-0 p-2">
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
          <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
        </div>
      </div>
    </div>
  );
}

export default memo(LiveQuotesWidget);
