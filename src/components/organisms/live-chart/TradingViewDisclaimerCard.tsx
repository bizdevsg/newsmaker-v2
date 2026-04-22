import Image from "next/image";
import { Card } from "@/components/atoms/Card";

export function TradingViewDisclaimerCard({
  warningText,
}: {
  warningText: string;
}) {
  return (
    <Card className="overflow-hidden border-amber-200 bg-gradient-to-r from-blue-50 via-white to-blue-100">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 shadow-sm ring-1 ring-blue-100">
            <Image
              src="/assets/tradingview-logo.png"
              alt="TradingView Logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
          </div>
          <div className="sm:hidden">
            <span className="font-bold uppercase tracking-[0.18em] text-blue-800">
              Disclaimer!
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="hidden sm:block">
            <p className="font-bold uppercase tracking-[0.18em] text-blue-800">
              Disclaimer!
            </p>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {warningText} Data pasar pada halaman ini merupakan referensi
            berdasarkan data dari{" "}
            <a
              href="https://www.tradingview.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
            >
              TradingView.com
            </a>
            . Informasi ini disediakan untuk tujuan informasi umum dan bukan
            merupakan saran atau rekomendasi.
          </p>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-900" />
    </Card>
  );
}
