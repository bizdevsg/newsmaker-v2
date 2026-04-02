export type FocusReportMarketGroup = "index" | "equity";

export type FocusReportItem = {
  symbol: string;
  displaySymbol: string;
  fallbackName: string;
  group: FocusReportMarketGroup;
  shortName?: string | null;
  longName?: string | null;
  instrumentType?: string | null;
  regularMarketPrice?: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
  priceHint?: number;
  currency?: string | null;
  exchangeName?: string | null;
  marketTime?: number | null;
  isAvailable: boolean;
  error?: string | null;
};

export type FocusReportResponse = {
  status?: string;
  fetchedAt?: string;
  total?: number;
  data?: FocusReportItem[];
};
