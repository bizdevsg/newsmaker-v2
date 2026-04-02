export type MarketSocketInfoMessage = {
  type?: "info";
  interval_ms?: number;
  message?: string;
  protocol?: string;
  symbols?: string[];
};

export type MarketSocketMarketItem = {
  symbol?: string;
  price?: number;
  change?: number;
  change_percent?: number;
  high?: number;
  low?: number;
};

export type MarketSocketMarketMessage = {
  type?: "market";
  at?: string;
  data?: MarketSocketMarketItem[];
};

export type MarketSocketMessage =
  | MarketSocketInfoMessage
  | MarketSocketMarketMessage;

export const MARKET_SOCKET_URL =
  process.env.NEXT_PUBLIC_MARKET_SOCKET_URL ?? "ws://localhost:3001";
