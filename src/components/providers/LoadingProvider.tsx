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

type LoadingContextValue = {
  start: (label?: string) => symbol;
  stop: (token: symbol) => void;
  isLoading: boolean;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);
const MAX_LOADING_MS = 10000;

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const tokens = useRef(new Set<symbol>());
  const tokenTimers = useRef(new Map<symbol, number>());

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

  const value = useMemo(
    () => ({
      start,
      stop,
      isLoading: pendingCount > 0,
    }),
    [start, stop, pendingCount],
  );

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
