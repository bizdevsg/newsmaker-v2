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

export type OjkRegulationRow = {
  url?: string;
  jenis?: string;
  judul?: string;
  nomor?: string;
  tahun?: number | string;
  sektor?: string;
  deskripsi?: string;
  sub_sektor?: string;
  raw_caption?: string | null;
  tahun_berlaku?: string;
};

export type OjkRegulationResponse = {
  source?: string;
  fetched_at?: string;
  cache?: string;
  page?: number;
  pages_fetched?: number;
  count?: number;
  data?: OjkRegulationRow[];
};

export type BappebtiDocumentLink = {
  url?: string;
  judul?: string;
};

export type BappebtiRegulationItem = {
  judul?: string;
  links?: BappebtiDocumentLink[] | null;
  tanggal?: string | null;
  tentang?: string | null;
  tupoksi?: string | null;
  detail_url?: string;
  tanggal_iso?: string | null;
};

export type BappebtiRegulationCategory = {
  key?: string;
  data?: BappebtiRegulationItem[];
  mode?: string;
  count?: number;
  label?: string;
  source?: string;
  pages_fetched?: number;
  tls_insecure_fallback_used?: boolean;
};

export type BappebtiRegulationResponse = {
  source?: string[];
  fetched_at?: string;
  cache?: string;
  max_pages_per_category?: number;
  categories_count?: number;
  count?: number;
  data?: BappebtiRegulationCategory[];
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
