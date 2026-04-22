"use client";

import React from "react";
import type { Messages } from "@/locales";
import { Card } from "../atoms/Card";
import { SectionHeader } from "../molecules/SectionHeader";
import { useLoading } from "../providers/LoadingProvider";

type LiveQuotesBoardProps = {
  messages: Messages;
  locale?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
};

type QuoteCategory = "futures" | "forex";

type QuoteSymbol = {
  symbol: string;
  label: string;
};

const TRADINGVIEW_WIDGET_URL =
  "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js";

const QUOTE_SYMBOLS: Record<QuoteCategory, QuoteSymbol[]> = {
  futures: [
    { symbol: "OANDA:XAUUSD", label: "Gold" },
    { symbol: "OANDA:XAGUSD", label: "Silver" },
    { symbol: "HSI:HSI", label: "Hang Seng" },
    { symbol: "SPREADEX:NIKKEI", label: "Nikkei 225" },
    { symbol: "OSE:DJIA1!", label: "DJIA1!" },
    { symbol: "IG:NASDAQ", label: "Nasdaq" },
    { symbol: "CAPITALCOM:DXY", label: "US Dollar Index" },
    { symbol: "FX_IDC:XAUIDRG", label: "Gold Rupiah" },
  ],
  forex: [
    { symbol: "FX:AUDUSD", label: "AUD/USD" },
    { symbol: "OANDA:EURUSD", label: "EUR/USD" },
    { symbol: "OANDA:GBPUSD", label: "GBP/USD" },
    { symbol: "OANDA:USDCHF", label: "USD/CHF" },
    { symbol: "FX:USDJPY", label: "USD/JPY" },
    { symbol: "FX_IDC:USDIDR", label: "USD/IDR" },
  ],
};

function TradingViewSingleQuote({
  symbol,
  locale,
  onReady,
}: {
  symbol: string;
  locale: string;
  onReady?: (symbol: string) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const widgetHost = container.querySelector(
      ".tradingview-widget-container__widget",
    );

    if (!(widgetHost instanceof HTMLDivElement)) return;

    widgetHost.replaceChildren();

    let isSettled = false;
    const readyTimeouts = new Set<number>();

    const settleReady = () => {
      if (isSettled) return;
      isSettled = true;
      readyTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      readyTimeouts.clear();
      onReady?.(symbol);
    };

    const watchIframe = (iframe: HTMLIFrameElement) => {
      iframe.addEventListener("load", settleReady, { once: true });
      const timeoutId = window.setTimeout(settleReady, 1200);
      readyTimeouts.add(timeoutId);
    };

    const observer = new MutationObserver(() => {
      const iframe = widgetHost.querySelector("iframe");
      if (iframe instanceof HTMLIFrameElement) {
        observer.disconnect();
        watchIframe(iframe);
      }
    });

    observer.observe(widgetHost, {
      childList: true,
      subtree: true,
    });

    const script = document.createElement("script");
    script.src = TRADINGVIEW_WIDGET_URL;
    script.type = "text/javascript";
    script.async = true;
    script.onerror = settleReady;
    script.text = JSON.stringify({
      symbol,
      colorTheme: "light",
      isTransparent: false,
      locale,
      width: "100%",
    });

    widgetHost.appendChild(script);
    const fallbackTimeoutId = window.setTimeout(settleReady, 5000);
    readyTimeouts.add(fallbackTimeoutId);

    return () => {
      observer.disconnect();
      readyTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      readyTimeouts.clear();
      widgetHost.replaceChildren();
    };
  }, [locale, onReady, symbol]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container min-w-[280px] shrink-0 rounded-xl border border-slate-200 bg-whiteshadow-sm overflow-hidden"
    >
      <div className="tradingview-widget-container__widget min-h-20" />
    </div>
  );
}

export function LiveQuotesBoard({
  messages,
  locale,
  title,
  subtitle,
  limit,
}: LiveQuotesBoardProps) {
  const { start, stop } = useLoading();
  const [activeCategory, setActiveCategory] =
    React.useState<QuoteCategory>("futures");
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const loadingTokenRef = React.useRef<symbol | null>(null);
  const initialGateDoneRef = React.useRef(false);
  const expectedSymbolsRef = React.useRef<Set<string>>(new Set());
  const readySymbolsRef = React.useRef<Set<string>>(new Set());

  const symbols = React.useMemo(() => {
    const source = QUOTE_SYMBOLS[activeCategory];
    return typeof limit === "number" ? source.slice(0, limit) : source;
  }, [activeCategory, limit]);

  const scrollByCards = React.useCallback((direction: -1 | 1) => {
    const element = scrollerRef.current;
    if (!element) return;

    const delta = Math.max(240, Math.round(element.clientWidth * 0.85));
    element.scrollBy({
      left: delta * direction,
      behavior: "smooth",
    });
  }, []);

  const resolvedTitle =
    title?.trim() || messages.focusReport.title || "Live Quotes";
  const resolvedSubtitle = subtitle?.trim();
  const widgetLocale = locale === "id" ? "id" : "en";

  React.useEffect(() => {
    if (initialGateDoneRef.current) return;
    if (!symbols.length) return;

    expectedSymbolsRef.current = new Set(symbols.map((item) => item.symbol));
    readySymbolsRef.current = new Set();

    if (!loadingTokenRef.current) {
      loadingTokenRef.current = start("homepage-tradingview");
    }

    return () => {
      if (loadingTokenRef.current && !initialGateDoneRef.current) {
        stop(loadingTokenRef.current);
        loadingTokenRef.current = null;
      }
    };
  }, [start, stop, symbols]);

  const handleWidgetReady = React.useCallback(
    (symbol: string) => {
      if (initialGateDoneRef.current) return;
      if (!expectedSymbolsRef.current.has(symbol)) return;

      readySymbolsRef.current.add(symbol);
      if (readySymbolsRef.current.size < expectedSymbolsRef.current.size)
        return;

      initialGateDoneRef.current = true;

      if (loadingTokenRef.current) {
        stop(loadingTokenRef.current);
        loadingTokenRef.current = null;
      }
    },
    [stop],
  );

  return (
    <Card>
      <SectionHeader
        title={resolvedTitle}
        optional={resolvedSubtitle}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50"
              aria-label="Scroll left"
            >
              <i className="fa-solid fa-chevron-left text-[11px]" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50"
              aria-label="Scroll right"
            >
              <i className="fa-solid fa-chevron-right text-[11px]" />
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={() => setActiveCategory("futures")}
          className={`h-7 rounded-full px-4 text-xs font-semibold transition ${
            activeCategory === "futures"
              ? "bg-blue-700 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          Futures
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("forex")}
          className={`h-7 rounded-full px-4 text-xs font-semibold transition ${
            activeCategory === "forex"
              ? "bg-blue-700 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          Forex
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {symbols.map((item) => (
          <TradingViewSingleQuote
            key={item.symbol}
            symbol={item.symbol}
            locale={widgetLocale}
            onReady={handleWidgetReady}
          />
        ))}
      </div>
    </Card>
  );
}
