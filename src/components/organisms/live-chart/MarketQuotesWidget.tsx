"use client";

import React, { memo, useEffect, useRef } from "react";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import type { Locale, Messages } from "@/locales";

const resolveTradingViewLocale = (value?: Locale | string) => {
  if (value === "id") return "id";
  return "en";
};

function MarketQuotesWidget({
  locale,
  messages,
}: {
  locale?: Locale;
  messages: Messages;
}) {
  const container = useRef<HTMLDivElement | null>(null);
  const title =
    messages.policy.liveChart.ohlcQuotes.title?.trim() || "Live Quotes";

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
      "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "light",
      locale: resolvedLocale,
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: true,
      backgroundColor: "#ffffff",
      support_host: "https://www.tradingview.com",
      width: "100%",
      height: 410,
      symbolsGroups: [
        {
          name: "product",
          symbols: [
            {
              name: "OANDA:XAUUSD",
              displayName: "Gold",
            },
            {
              name: "OANDA:XAGUSD",
              displayName: "Silver",
            },
            {
              name: "ACTIVTRADES:BRENTM2026",
              displayName: "Brent Oil",
            },
            {
              name: "VANTAGE:HK50",
              displayName: "Hang Seng",
            },
            {
              name: "SPREADEX:NIKKEI",
              displayName: "NIKKEI 225",
            },
            {
              name: "OSE:DJIA1!",
              displayName: "DJIA1!",
            },
            {
              name: "IG:NASDAQ",
              displayName: "NASDAQ",
            },
            {
              name: "CAPITALCOM:DXY",
              displayName: "US Dollar Index",
            },
            {
              name: "FX_IDC:XAUIDRG",
              displayName: "Gold Rupiah",
            },
            {
              name: "OANDA:AUDUSD",
              displayName: "AUD/USD",
            },
            {
              name: "OANDA:EURUSD",
              displayName: "EUR/USD",
            },
            {
              name: "OANDA:GBPUSD",
              displayName: "GBP/USD",
            },
            {
              name: "OANDA:USDCHF",
              displayName: "USD/CHF",
            },
            {
              name: "OANDA:USDJPY",
              displayName: "USD/JPY",
            },
            {
              name: "FX_IDC:USDIDR",
              displayName: "USD/IDR",
            },
          ],
        },
      ],
    });

    container.current.appendChild(script);

    return () => {
      script.remove();
    };
  }, [locale]);

  return (
    <Card className="overflow-hidden">
      <SectionHeader title={title} />
      <div className="p-4">
        <div
          className="tradingview-widget-container overflow-hidden rounded-xl border border-slate-200"
          ref={container}
        >
          <div className="tradingview-widget-container__widget min-h-[410px] h-full" />
          <div className="border-t border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
            <a
              href="https://www.tradingview.com/markets/"
              rel="noopener nofollow"
              target="_blank"
              className="text-blue-600 hover:text-blue-800"
            >
              Market summary
            </a>{" "}
            by TradingView
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(MarketQuotesWidget);
