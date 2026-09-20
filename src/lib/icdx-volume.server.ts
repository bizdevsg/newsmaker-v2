import "server-only";

import type { IcdxVolumeResponse, IcdxVolumeRow } from "@/types/indonesiaMarket";

// ICDX does not publish a public API or a regular per-period volume feed
// (unlike JFX/BBJ's `jfx-volume.server.ts`, which reads a live chart
// endpoint). Its press releases are irregular in both cadence and
// phrasing, and neither plain regex nor an LLM reader could reliably tell
// a combined (Multilateral + Sistem Perdagangan Alternatif/ATS) total
// apart from a segment-only figure across the full history — see the
// verification notes on each row below. So this list is curated by hand
// from ICDX press releases that do state a clean combined total for one
// full, completed period.
//
// To add a new period: find an ICDX press release at
// https://www.icdx.co.id/news/press-release stating a combined total
// volume (in "lot") for one full month/quarter/semester — not a
// single-day figure, not a Multilateral-only or ATS-only figure. Add a
// row below with that number, quoting the source sentence in `notes` for
// future verification, and keep `sortKey` as the period's end date
// (YYYYMMDD) so the chart stays chronologically ordered.

const ICDX_BASE = "https://www.icdx.co.id";

type CuratedRow = IcdxVolumeRow & { sortKey: number };

const ICDX_VOLUME_DATA: CuratedRow[] = [
  {
    periodLabel: "Kuartal I 2024",
    sortKey: 20240331,
    volumeLot: 3_375_229.15,
    notionalValueTriliun: 5.989,
    sourceUrl: `${ICDX_BASE}/news-detail/press-release/pemilu-tak-berikan-efek-negatif-icdx-catat-pertumbuhan-transaksi-di-q1-2024`,
    sourceTitle: "Pemilu tak berikan efek negatif, ICDX catat pertumbuhan transaksi di Q1 2024",
  },
  {
    periodLabel: "Semester I 2024",
    sortKey: 20240630,
    volumeLot: 5_724_852.55,
    notionalValueTriliun: 10.794,
    sourceUrl: `${ICDX_BASE}/news-detail/press-release/semester-i-tahun-2024-icdx-catatkan-volume-transaksi-5-7-juta-lot`,
    sourceTitle: "Semester I tahun 2024, ICDX catatkan volume transaksi 5,7 juta lot",
  },
  {
    periodLabel: "Juli 2024",
    sortKey: 20240731,
    volumeLot: 804_300.73,
    notionalValueTriliun: 1.807,
    sourceUrl: `${ICDX_BASE}/news-detail/press-release/icdx-catat-notional-value-transaksi-sebesar-rp1-807-triliun`,
    sourceTitle: "ICDX catat notional value transaksi sebesar Rp1.807 Triliun",
  },
  {
    periodLabel: "Oktober 2024",
    sortKey: 20241031,
    volumeLot: 1_012_795,
    notionalValueTriliun: 2.256,
    sourceUrl: `${ICDX_BASE}/news-detail/press-release/kontrak-berjangka-komoditas-emas-mendominasi-transaksi-multilateral-di-icdx`,
    sourceTitle: "Kontrak Berjangka Komoditas Emas mendominasi Transaksi Multilateral di ICDX",
  },
  {
    // Figure appears as the year-over-year comparison base inside the
    // Kuartal I 2026 article below: "...dibandingkan periode yang sama
    // tahun 2025 dengan total volume transaksi sebesar 2.435.491 lot" /
    // "Notional Value dalam periode yang sama pada tahun 2025 sebesar
    // Rp 6.360 Triliun".
    periodLabel: "Kuartal I 2025",
    sortKey: 20250331,
    volumeLot: 2_435_491,
    notionalValueTriliun: 6.36,
    sourceUrl: `${ICDX_BASE}/news-detail/press-release/transaksi-perdagangan-berjangka-komoditi-kuartal-i-tahun-2026-notional-value-transaksi-di-icdx-capai-rp-12-477-triliun`,
    sourceTitle:
      "Transaksi Perdagangan Berjangka Komoditi Kuartal I tahun 2026, Notional Value transaksi di ICDX capai Rp 12.477 Triliun",
  },
  {
    // Full calendar year, quoted from the "Hari Pertama 2026" article:
    // "sepanjang tahun 2025, terdapat 260 hari transaksi dengan total
    // transaksi mencapai 5.167.243 lot". No separate notional value was
    // given for the full year in that article.
    periodLabel: "Tahun 2025",
    sortKey: 20251231,
    volumeLot: 5_167_243,
    sourceUrl: `${ICDX_BASE}/news-detail/press-release/hari-pertama-transaksi-tahun-2026-icdx-catat-volume-transaksi-28-621-lot-senilai-rp-130-triliun`,
    sourceTitle: "Hari Pertama Transaksi tahun 2026 ICDX catat volume transaksi 28.621 lot senilai Rp 130 Triliun",
  },
  {
    periodLabel: "Kuartal I 2026",
    sortKey: 20260331,
    volumeLot: 2_610_010,
    notionalValueTriliun: 12.477,
    sourceUrl: `${ICDX_BASE}/news-detail/press-release/transaksi-perdagangan-berjangka-komoditi-kuartal-i-tahun-2026-notional-value-transaksi-di-icdx-capai-rp-12-477-triliun`,
    sourceTitle:
      "Transaksi Perdagangan Berjangka Komoditi Kuartal I tahun 2026, Notional Value transaksi di ICDX capai Rp 12.477 Triliun",
  },
];

export async function fetchIcdxVolume(): Promise<IcdxVolumeResponse | null> {
  const data = [...ICDX_VOLUME_DATA].sort((a, b) => a.sortKey - b.sortKey);
  return {
    data,
    source: `${ICDX_BASE}/news/press-release`,
    parse_warning: false,
  };
}
