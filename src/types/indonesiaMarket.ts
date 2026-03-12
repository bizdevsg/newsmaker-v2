export type FxRow = {
  currency?: string;
  unit?: number;
  sell?: number;
  buy?: number;
};

export type FxResponse = {
  data?: FxRow[];
  fetched_at?: string;
};

export type BiRateRow = {
  date?: string;
  rate?: number;
  raw_date?: string;
  raw_rate?: string;
  press_release_url?: string;
};

export type BiRateResponse = {
  source?: string;
  data?: BiRateRow[];
  fetched_at?: string;
};

export type MarketIndex = {
  last?: number;
  change?: number;
  change_percent?: number;
  direction?: "up" | "down";
};

export type IhsgResponse = {
  indices?: {
    composite?: MarketIndex;
    idx30?: MarketIndex;
    lq45?: MarketIndex;
    kompas100?: MarketIndex;
  };
  fetched_at?: string;
};

export type LiveQuoteItem = {
  symbol: string;
  price?: number;
  last?: number;
  buy?: number;
  sell?: number;
  valueChange?: number;
  percentChange?: number;
  serverTime?: string;
  serverDateTime?: string;
};

export type LiveQuoteResponse = {
  status?: string;
  updatedAt?: string;
  serverTime?: string;
  total?: number;
  data?: LiveQuoteItem[];
};
