import { ExchangeActivityClient } from "./ExchangeActivityClient";
import type { Messages } from "@/locales";
import type {
  FxResponse,
  IhsgResponse,
  LiveQuoteResponse,
} from "@/types/indonesiaMarket";

type ExchangeActivityProps = {
  messages: Messages;
};

const LIVE_QUOTES_URL =
  "https://endpoapi-production-3202.up.railway.app/api/live-quotes";
const API_TOKEN = process.env.ENDPO_NM23_TOKEN ?? "";
const API_BASE = process.env.ENDPO_NM23_BASE ?? "";

const API_ENDPOINTS = {
  fx: `${API_BASE}/api/newsmaker-v2/fx`,
  ihsg: `${API_BASE}/api/newsmaker-v2/market`,
};

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: url === LIVE_QUOTES_URL ? undefined : { Authorization: `Bearer ${API_TOKEN}` },
      next: { revalidate: 30 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export async function ExchangeActivity({ messages }: ExchangeActivityProps) {
  const [liveQuotes, fxResponse, ihsgResponse] = await Promise.all([
    fetchJson<LiveQuoteResponse>(LIVE_QUOTES_URL),
    fetchJson<FxResponse>(API_ENDPOINTS.fx),
    fetchJson<IhsgResponse>(API_ENDPOINTS.ihsg),
  ]);

  return (
    <ExchangeActivityClient
      messages={messages}
      liveQuotes={liveQuotes}
      fxResponse={fxResponse}
      ihsgResponse={ihsgResponse}
    />
  );
}
