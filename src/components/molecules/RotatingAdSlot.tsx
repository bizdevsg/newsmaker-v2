"use client";

import React from "react";
import { RotatingAd, type RotatingAdItem } from "@/components/molecules/RotatingAd";
import { useLoading } from "@/components/providers/LoadingProvider";

type AdsResponse = {
  status?: string;
  data?: RotatingAdItem[];
};

type RotatingAdSlotProps = {
  endpoint?: string;
  slot: string;
  rotationKey?: string;
  locale?: string;
  className?: string;
  refreshOnFocus?: boolean;
};

export function RotatingAdSlot({
  endpoint = "/api/ads",
  slot,
  rotationKey,
  locale,
  className,
  refreshOnFocus = true,
}: RotatingAdSlotProps) {
  const { start, stop } = useLoading();
  const [items, setItems] = React.useState<RotatingAdItem[]>([]);

  const fetchAds = React.useCallback(
    async (signal?: AbortSignal, withLoading = false) => {
      const token = withLoading ? start("ads") : null;
      try {
        const res = await fetch(endpoint, { cache: "no-store", signal });
        const json = (await res
          .json()
          .catch(() => null)) as AdsResponse | null;
        const nextItems = Array.isArray(json?.data) ? json?.data : [];

        if (!res.ok || nextItems.length === 0) return;
        setItems(nextItems);
      } finally {
        if (token) stop(token);
      }
    },
    [endpoint, start, stop],
  );

  React.useEffect(() => {
    const controller = new AbortController();

    fetchAds(controller.signal, true).catch(() => {
      // ignore
    });

    return () => {
      controller.abort();
    };
  }, [fetchAds, rotationKey]);

  React.useEffect(() => {
    if (!refreshOnFocus) return;

    const handleFocus = () => {
      fetchAds().catch(() => {
        // ignore
      });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchAds, refreshOnFocus]);

  return (
    <RotatingAd
      items={items}
      slot={slot}
      rotationKey={rotationKey}
      locale={locale}
      className={className}
    />
  );
}
