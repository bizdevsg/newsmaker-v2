"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
const ROUTE_LOADING_MIN_MS = 250;
const ROUTE_LOADING_MAX_MS = 5000;
const HIDE_AFTER_IDLE_MS = 200;
const INITIAL_ROUTE_GRACE_MS = 900;
const MIN_OVERLAY_VISIBLE_MS = 5000;

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
          src="/assets/NewsMaker-White 1.png"
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
  const routeTokenRef = useRef<symbol | null>(null);
  const routeStartedAtRef = useRef(0);
  const initialLoadRef = useRef(true);
  const overlayStartedAtRef = useRef(0);
  const sawNonRouteTokenRef = useRef(false);
  const routeMaxTimerRef = useRef<number | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams?.toString() ?? "";

  const start = useCallback((label?: string) => {
    const token = Symbol(label ?? "loading");
    if (routeTokenRef.current && token !== routeTokenRef.current) {
      sawNonRouteTokenRef.current = true;
    }
    tokens.current.add(token);
    setPendingCount((count) => count + 1);
    setShowOverlay(true);
    setFadeOut(false);
    if (!overlayStartedAtRef.current) {
      overlayStartedAtRef.current = Date.now();
    }
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
    if (routeTokenRef.current === token) {
      initialLoadRef.current = false;
      routeTokenRef.current = null;
      sawNonRouteTokenRef.current = false;
      if (routeMaxTimerRef.current) {
        window.clearTimeout(routeMaxTimerRef.current);
        routeMaxTimerRef.current = null;
      }
    }
  }, []);

  useLayoutEffect(() => {
    if (routeTokenRef.current) {
      stop(routeTokenRef.current);
      routeTokenRef.current = null;
    }
    if (routeMaxTimerRef.current) {
      window.clearTimeout(routeMaxTimerRef.current);
      routeMaxTimerRef.current = null;
    }

    routeStartedAtRef.current = Date.now();
    sawNonRouteTokenRef.current = false;

    const routeToken = start("route");
    routeTokenRef.current = routeToken;

    routeMaxTimerRef.current = window.setTimeout(() => {
      if (routeTokenRef.current === routeToken) {
        stop(routeToken);
      }
    }, ROUTE_LOADING_MAX_MS);

    return () => {
      if (routeMaxTimerRef.current) {
        window.clearTimeout(routeMaxTimerRef.current);
        routeMaxTimerRef.current = null;
      }
      if (routeTokenRef.current === routeToken) {
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
    const routeToken = routeTokenRef.current;
    if (!routeToken) return;

    const elapsed = Date.now() - routeStartedAtRef.current;
    const minVisibleMs = initialLoadRef.current
      ? INITIAL_ROUTE_GRACE_MS
      : ROUTE_LOADING_MIN_MS;
    const waitMs = Math.max(0, minVisibleMs - elapsed);

    // If no data fetch starts on this route, stop after a small minimum delay
    // to prevent flicker. If data fetches do start, keep the route token alive
    // until they finish so the overlay doesn't disappear too early.
    if (!sawNonRouteTokenRef.current) {
      const timer = window.setTimeout(() => {
        if (routeTokenRef.current !== routeToken) return;
        if (sawNonRouteTokenRef.current) return;
        stop(routeToken);
      }, waitMs);
      return () => window.clearTimeout(timer);
    }

    // If other tokens have started, only stop once we're back to just the route token.
    if (pendingCount !== 1) return;
    const timer = window.setTimeout(() => {
      if (routeTokenRef.current !== routeToken) return;
      if (pendingCount !== 1) return;
      stop(routeToken);
    }, waitMs);
    return () => window.clearTimeout(timer);
  }, [pendingCount, stop]);

  useEffect(() => {
    if (value.isLoading) {
      return;
    }

    if (showOverlay) {
      let hideTimeout: number | undefined;
      const elapsed = overlayStartedAtRef.current
        ? Date.now() - overlayStartedAtRef.current
        : 0;
      const remaining = Math.max(0, MIN_OVERLAY_VISIBLE_MS - elapsed);
      const fadeDelay = Math.max(HIDE_AFTER_IDLE_MS, remaining);

      const fadeTimeout = window.setTimeout(() => {
        setFadeOut(true);
        hideTimeout = window.setTimeout(() => {
          setShowOverlay(false);
          setFadeOut(false);
          overlayStartedAtRef.current = 0;
        }, 300);
      }, fadeDelay);
      return () => {
        window.clearTimeout(fadeTimeout);
        if (hideTimeout) window.clearTimeout(hideTimeout);
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
