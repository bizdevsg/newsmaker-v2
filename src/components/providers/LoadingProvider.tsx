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
        "fixed inset-0 z-100 grid place-items-center bg-blue-500 backdrop-blur-sm",
        "transition-opacity duration-300 ease-out",
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
    >
      <div className="flex flex-col items-center">
        <Image
          src="/assets/NewsMaker-23-logo-white.png"
          alt="Logo Newsmaker23"
          width={240}
          height={66}
          priority
          className="animate-pulse"
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
  const showTimerRef = useRef<number | null>(null);

  const start = useCallback((label?: string) => {
    const token = Symbol(label ?? "loading");
    tokens.current.add(token);
    setPendingCount((count) => count + 1);
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
    const routeToken = start("route");
    const timeout = setTimeout(() => {
      stop(routeToken);
    }, 150);
    return () => clearTimeout(timeout);
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
      if (showTimerRef.current) return;
      showTimerRef.current = window.setTimeout(() => {
        setShowOverlay(true);
        setFadeOut(false);
        showTimerRef.current = null;
      }, 0);
      return;
    }

    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (showOverlay) {
      setFadeOut(true);
      const timeout = setTimeout(() => {
        setShowOverlay(false);
        setFadeOut(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [value.isLoading, showOverlay]);

  useEffect(() => {
    if (!showOverlay) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarGap =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollBarGap > 0) {
      document.body.style.paddingRight = `${scrollBarGap}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [showOverlay]);

  useEffect(() => {
    return () => {
      tokenTimers.current.forEach((timer) => window.clearTimeout(timer));
      tokenTimers.current.clear();
      tokens.current.clear();
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
