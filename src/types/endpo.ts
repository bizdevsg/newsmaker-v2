// Shape diverifikasi dengan curl ke endpo.nm23 (2 Nov 2026).

export type EndpoFxRow = {
  currency?: string;
  unit?: number;
  sell?: number;
  buy?: number;
};

export type EndpoFxResponse = {
  source?: string;
  count?: number;
  data?: EndpoFxRow[];
  fetched_at?: string;
  cache?: string;
};

export type EndpoRateItem = {
  key?: string;
  label?: string;
  country?: string;
  source?: string;
  cache?: string;
  fetched_at?: string;
  rate?: number;
  previous_rate?: number;
  unit?: string;
  date?: string | null;
  previous_date?: string | null;
  reference_period?: string | null;
  source_last_update?: string | null;
  press_release_url?: string | null;
};

export type EndpoRatesResponse = {
  fetched_at?: string;
  count?: number;
  data?: Record<string, EndpoRateItem>;
};

export type EndpoSignalIndicator = {
  name?: string;
  indicator?: string;
  group?: string;
  value?: number;
  signal?: string;
  action?: string;
};

export type EndpoSignalTally = {
  label?: string;
  summary?: string;
  detail?: {
    buy?: number;
    sell?: number;
    neutral?: number;
  };
  total?: number;
};

export type EndpoSignalResponse = {
  candleStats?: {
    interval?: string;
    available?: number;
    required?: number;
    missing?: number;
    isSufficient?: boolean;
    minuteHistoryCount?: number;
  };
  oscillatorSummary?: EndpoSignalTally;
  movingAverageSummary?: EndpoSignalTally;
  summary?: EndpoSignalTally;
  indicatorDetails?: {
    oscillators?: { label?: string; indicators?: EndpoSignalIndicator[] };
    movingAverages?: { label?: string; indicators?: EndpoSignalIndicator[] };
  };
  errorCode?: string;
  note?: string;
};

export type EndpoInvestingRow = {
  symbol?: string;
  last?: number;
  change?: number;
  change_percent?: number;
  currency?: string;
};

export type EndpoInvestingResponse = {
  fetched_at?: string;
  cache?: string;
  data?: EndpoInvestingRow[];
};

export type EndpoInvestingQuoteResponse = {
  source?: string;
  fetched_at?: string;
  cache?: string;
  data?: EndpoInvestingRow;
};
