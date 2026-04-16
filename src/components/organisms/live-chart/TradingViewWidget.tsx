"use client";

import React, { memo, useEffect, useRef } from "react";
import type { Locale } from "@/locales";

const resolveTradingViewLocale = (value?: Locale | string) => {
  if (value === "id") return "id";
  return "en";
};

function TradingViewWidget({ locale }: { locale?: Locale }) {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current) return;
    const resolvedLocale = resolveTradingViewLocale(locale);

    const existingScripts = Array.from(
      container.current.querySelectorAll("script"),
    );
    existingScripts.forEach((node) => node.remove());

    const widgetNode = container.current.querySelector(
      ".tradingview-widget-container__widget",
    ) as HTMLDivElement | null;
    if (widgetNode) widgetNode.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "allow_symbol_change": true,
          "calendar": false,
          "details": false,
          "hide_side_toolbar": true,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "hide_volume": false,
          "hotlist": false,
          "interval": "60",
          "locale": "${resolvedLocale}",
          "save_image": true,
          "style": "1",
          "symbol": "OANDA:XAUUSD",
          "theme": "light",
          "timezone": "Etc/UTC",
          "backgroundColor": "#FFFFFF",
          "gridColor": "rgba(242, 242, 242, 0.06)",
          "watchlist": [],
          "withdateranges": false,
          "compareSymbols": [],
          "studies": [],
          "autosize": true
        }`;

    container.current.appendChild(script);

    return () => {
      script.remove();
    };
  }, [locale]);

  return (
    <div
      className="tradingview-widget-container rounded-xl border border-blue-200 overflow-hidden"
      ref={container}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ flex: "1 1 auto", minHeight: 0, width: "100%" }}
      ></div>
    </div>
  );
}

export default memo(TradingViewWidget);
