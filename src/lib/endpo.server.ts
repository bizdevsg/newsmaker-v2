import "server-only";

import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import type {
  BappebtiRegulationResponse,
  BiRateResponse,
  JfxVolumeResponse,
  OjkRegulationResponse,
} from "@/types/indonesiaMarket";
import type {
  EndpoFxResponse,
  EndpoInvestingQuoteResponse,
  EndpoInvestingResponse,
  EndpoRatesResponse,
  EndpoSignalResponse,
} from "@/types/endpo";

const BASE_URL = (process.env.ENDPO_BASE_URL ?? "").trim().replace(/\/+$/, "");
const API_TOKEN = (process.env.ENDPO_API_TOKEN ?? "").trim();
// Request pertama setelah endpo idle bisa 10-25 detik karena scraping live.
const TIMEOUT_MS = 30_000;
const REVALIDATE_SECONDS = 60;
// Nginx di depan endpo membalas 503 kalau request terlalu rapat.
const RETRY_DELAY_MS = 1_000;

export type EndpoErrorCode =
  | "not_configured"
  | "unauthorized"
  | "timeout"
  | "network"
  | "http"
  | "invalid_response";

export type EndpoError = {
  code: EndpoErrorCode;
  status?: number;
  message: string;
};

export type EndpoResult<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: EndpoError };

type QueryParams = Record<string, string | number | undefined>;

const failure = (error: EndpoError): EndpoResult<never> => ({
  ok: false,
  data: null,
  error,
});

const isRetryable = ({ code, status }: EndpoError) =>
  code === "network" || (code === "http" && (status ?? 0) >= 500);

const buildQuery = (params: QueryParams = {}) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
};

const requestEndpo = async <T,>(url: string): Promise<EndpoResult<T>> => {
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        next: { revalidate: REVALIDATE_SECONDS },
      },
      TIMEOUT_MS,
    );

    if (response.status === 401) {
      return failure({
        code: "unauthorized",
        status: 401,
        message: "token ditolak, cek ENDPO_API_TOKEN",
      });
    }

    if (!response.ok) {
      return failure({
        code: "http",
        status: response.status,
        message: `HTTP ${response.status}`,
      });
    }

    const data = (await response.json().catch(() => null)) as T | null;
    if (data === null || typeof data !== "object") {
      return failure({
        code: "invalid_response",
        message: "respons bukan JSON yang valid",
      });
    }

    return { ok: true, data, error: null };
  } catch (error) {
    return error instanceof Error && error.name === "AbortError"
      ? failure({
          code: "timeout",
          message: `tidak merespons dalam ${TIMEOUT_MS / 1000} detik`,
        })
      : failure({ code: "network", message: "gagal terhubung ke endpo" });
  }
};

const fetchEndpo = async <T,>(
  path: string,
  params?: QueryParams,
): Promise<EndpoResult<T>> => {
  const missingEnv = [
    !BASE_URL && "ENDPO_BASE_URL",
    !API_TOKEN && "ENDPO_API_TOKEN",
  ].filter(Boolean);

  let result: EndpoResult<T>;
  if (missingEnv.length > 0) {
    result = failure({
      code: "not_configured",
      message: `env belum diisi: ${missingEnv.join(", ")}`,
    });
  } else {
    const url = `${BASE_URL}${path}${buildQuery(params)}`;
    result = await requestEndpo<T>(url);
    // Timeout tidak diulang supaya halaman tidak tertahan sampai 60 detik.
    if (!result.ok && isRetryable(result.error)) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      result = await requestEndpo<T>(url);
    }
  }

  // Log path dan pesan singkat saja, URL dan token tidak boleh ikut tercetak.
  if (!result.ok) console.warn(`[endpo] ${path} gagal: ${result.error.message}`);
  return result;
};

export const getBiRate = () => fetchEndpo<BiRateResponse>("/bi-rate");

export const getFx = () => fetchEndpo<EndpoFxResponse>("/fx");

export const getRates = () => fetchEndpo<EndpoRatesResponse>("/rates");

// HTTP 200 pun bisa berisi errorCode (mis. SIGNAL_INSUFFICIENT_CANDLE_HISTORY),
// jadi cek candleStats.isSufficient sebelum dipakai.
export const getSignal = () => fetchEndpo<EndpoSignalResponse>("/signal");

export const getInvesting = () =>
  fetchEndpo<EndpoInvestingResponse>("/investing");

// Slug bukan kode saham: "bca" valid untuk BBCA, sedangkan "BBCA" dan "bri" 404.
export const getInvestingQuote = (slug: string) =>
  fetchEndpo<EndpoInvestingQuoteResponse>(
    `/investing/${encodeURIComponent(slug)}`,
  );

export const getBappebti = () =>
  fetchEndpo<BappebtiRegulationResponse>("/bappebti");

export const getOjkRegulations = (params?: { page?: number }) =>
  fetchEndpo<OjkRegulationResponse>("/ojk/regulasi", params);

export const getJfxVolume = (params?: { month?: number; year?: number }) =>
  fetchEndpo<JfxVolumeResponse>("/jfx/volume", params);

// Shape belum terverifikasi (504 dari gateway saat terakhir dites), jadi sengaja
// unknown sampai ada respons sukses untuk dicek.
export const getIcdxPressRelease = () =>
  fetchEndpo<unknown>("/icdx/press-release");
