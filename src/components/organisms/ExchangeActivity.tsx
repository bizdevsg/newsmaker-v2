import { ExchangeActivityClient } from "./ExchangeActivityClient";
import type { Messages } from "@/locales";
import type { LiveQuoteResponse } from "@/types/indonesiaMarket";
import { getFx } from "@/lib/endpo.server";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

type ExchangeActivityProps = {
  messages: Messages;
};

const LIVE_QUOTES_URL =
  "/api/live-quotes";

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetchWithTimeout(url, {
      method: "GET",
      next: { revalidate: 30 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export async function ExchangeActivity({ messages }: ExchangeActivityProps) {
  const [liveQuotes, { data: fxResponse }] = await Promise.all([
    fetchJson<LiveQuoteResponse>(LIVE_QUOTES_URL),
    getFx(),
  ]);

  return (
    <ExchangeActivityClient
      messages={messages}
      liveQuotes={liveQuotes}
      fxResponse={fxResponse}
    />
  );
}
