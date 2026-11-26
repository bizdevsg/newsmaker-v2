import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { getMessages, type Locale } from "@/locales";

const TRADEPILOT_URL = "https://tradepilot.id/?embed=1";

export const metadata: Metadata = {
  title: "Trade Pilot",
};

const COPY = {
  id: {
    kicker: "Layanan Teknologi Mitra Newsmaker.id",
    title: "TradePilot — AI Market Navigator",
    description:
      "Perangkat bantu navigasi pasar, analisis data, dan simulasi risiko berbasis kecerdasan buatan yang dikembangkan dan dioperasikan oleh TradePilot.id.",
    poweredBy: "Powered by",
    disclaimerTitle: "Disclaimer",
    disclaimer: [
      "TradePilot merupakan layanan teknologi mitra yang dikembangkan dan dioperasikan oleh TradePilot.id.",
      "Hasil analisis dan simulasi dihasilkan secara otomatis oleh sistem AI TradePilot dan bukan produk jurnalistik, opini, maupun rekomendasi resmi redaksi Newsmaker.id.",
      "Penggunaan layanan bersifat opsional. Pembelian kredit dilakukan secara terpisah melalui TradePilot.id.",
      "Hasil analisis dapat mengandung ketidakakuratan dan tidak menjamin hasil perdagangan. Keputusan transaksi tetap berada pada pengguna.",
      "Kerja sama teknologi ini tetap menjunjung independensi editorial Newsmaker.id.",
    ],
  },
  en: {
    kicker: "Technology Partner Service of Newsmaker.id",
    title: "TradePilot — AI Market Navigator",
    description:
      "An AI-based tool for market navigation, data analysis, and risk simulation, developed and operated by TradePilot.id.",
    poweredBy: "Powered by",
    disclaimerTitle: "Disclaimer",
    disclaimer: [
      "TradePilot is a partner technology service developed and operated by TradePilot.id.",
      "Analyses and simulations are generated automatically by the TradePilot AI system and are not journalistic products, opinions, or official recommendations of the Newsmaker.id editorial team.",
      "Use of the service is optional. Credits are purchased separately through TradePilot.id.",
      "Analysis results may contain inaccuracies and do not guarantee trading outcomes. Trading decisions remain the responsibility of the user.",
      "This technology partnership upholds the editorial independence of Newsmaker.id.",
    ],
  },
} as const;

export default async function TradePilotPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "id";
  const messages = getMessages(locale);
  const copy = COPY[locale];

  return (
    <MarketPageTemplate locale={locale} messages={messages}>
      <Container as="section" className="px-4 py-6">
        <div className="flex flex-col gap-4">
          <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#07224f] via-[#0b3a82] to-[#1061B3] px-6 py-6 text-white shadow-lg sm:px-8">
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="shrink-0 self-start sm:self-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/Logo%20Trade%20Pilot-white.png"
                    alt="TradePilot"
                    className="h-12 w-auto sm:h-14"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200">
                    {copy.kicker}
                  </p>
                  <h1 className="text-xl font-bold leading-snug sm:text-2xl">
                    {copy.title}
                  </h1>
                  <p className="max-w-3xl text-sm leading-6 text-white/85">
                    {copy.description}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-semibold text-white/80 md:text-right">
                {copy.poweredBy}{" "}
                <span className="font-bold text-amber-300">TradePilot.id</span>
              </p>
            </div>
          </header>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <iframe
              src={TRADEPILOT_URL}
              title="Trade Pilot"
              className="block h-[80vh] min-h-[640px] w-full border-0 bg-white"
              allow="clipboard-write; fullscreen"
            />
          </div>

          <aside className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-slate-800">
            <div className="flex flex-col gap-3 md:flex-row md:gap-6">
              <div className="flex shrink-0 items-start gap-3 md:w-44">
                <i
                  className="fa-solid fa-triangle-exclamation mt-1 text-2xl text-amber-500"
                  aria-hidden="true"
                />
                <h2 className="text-lg font-bold text-slate-900">
                  {copy.disclaimerTitle}
                </h2>
              </div>
              <div className="space-y-2 border-amber-200 text-sm leading-6 text-slate-700 md:border-l md:pl-6">
                {copy.disclaimer.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </MarketPageTemplate>
  );
}
