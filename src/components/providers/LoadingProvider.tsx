"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

type LoadingContextValue = {
  start: (label?: string) => symbol;
  stop: (token: symbol) => void;
  isLoading: boolean;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);
const MAX_LOADING_MS = 10000;

function GlobalLoadingOverlay({ fadingOut }: { fadingOut: boolean }) {
  return (
    <div
      className={[
        "fixed inset-0 z-100 grid place-items-center bg-[#1061B3] backdrop-blur-sm",
        "transition-opacity duration-300 ease-out",
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
    >
      <div className="flex w-full max-w-[min(52vw,180px)] flex-col items-center px-3 sm:max-w-[220px] md:max-w-[240px]">
        <Image
          src="/assets/NewsMaker-23-logo-white.png"
          alt="Logo Newsmaker23"
          width={240}
          height={66}
          sizes="(max-width: 640px) 52vw, (max-width: 768px) 220px, 240px"
          priority
          className="h-auto w-full animate-pulse"
        />
      </div>
    </div>
  );
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const tokens = useRef(new Set<symbol>());
  const tokenTimers = useRef(new Map<symbol, number>());
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams?.toString() ?? "";

  const start = useCallback((label?: string) => {
    const token = Symbol(label ?? "loading");
    tokens.current.add(token);
    setPendingCount((count) => count + 1);
    setShowOverlay(true);
    setFadeOut(false);
    const timer = window.setTimeout(() => {
      // Safety: auto-stop if a request hangs
      if (tokens.current.has(token)) {
        tokens.current.delete(token);
        setPendingCount((count) => Math.max(0, count - 1));
      }
      tokenTimers.current.delete(token);
    }, MAX_LOADING_MS);
    tokenTimers.current.set(token, timer);
    return token;
  }, []);

  const stop = useCallback((token: symbol) => {
    if (!tokens.current.has(token)) return;
    tokens.current.delete(token);
    setPendingCount((count) => Math.max(0, count - 1));
    const timer = tokenTimers.current.get(token);
    if (timer) {
      window.clearTimeout(timer);
      tokenTimers.current.delete(token);
    }
  }, []);

  useEffect(() => {
    let routeToken: symbol | null = null;
    const startTimeout = window.setTimeout(() => {
      routeToken = start("route");
    }, 0);
    const stopTimeout = window.setTimeout(() => {
      if (routeToken) {
        stop(routeToken);
      }
    }, 150);

    return () => {
      window.clearTimeout(startTimeout);
      window.clearTimeout(stopTimeout);
      if (routeToken) {
        stop(routeToken);
      }
    };
  }, [pathname, searchKey, start, stop]);

  const value = useMemo(
    () => ({
      start,
      stop,
      isLoading: pendingCount > 0,
    }),
    [start, stop, pendingCount],
  );

  useEffect(() => {
    if (value.isLoading) {
      return;
    }

    if (showOverlay) {
      const fadeTimeout = window.setTimeout(() => {
        setFadeOut(true);
      }, 0);
      const hideTimeout = window.setTimeout(() => {
        setShowOverlay(false);
        setFadeOut(false);
      }, 300);
      return () => {
        window.clearTimeout(fadeTimeout);
        window.clearTimeout(hideTimeout);
      };
    }
  }, [value.isLoading, showOverlay]);

  useEffect(() => {
    const tokenTimersRef = tokenTimers.current;
    const tokensRef = tokens.current;

    return () => {
      tokenTimersRef.forEach((timer) => window.clearTimeout(timer));
      tokenTimersRef.clear();
      tokensRef.clear();
    };
  }, []);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {showOverlay ? <GlobalLoadingOverlay fadingOut={fadeOut} /> : null}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider.");
  }
  return context;
}
