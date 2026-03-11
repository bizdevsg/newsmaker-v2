import React from "react";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { Card } from "@/components/atoms/Card";
import { getMessages, type Locale } from "@/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = rawLocale === "en" ? "en" : "id";
    return {
        title: locale === "id" ? "Riset Perusahaan & Ekuitas | NewsMaker" : "Company & Equity Research | NewsMaker",
        description: locale === "id" ? "Rekomendasi emiten, target harga, dan analisis laporan keuangan komprehensif." : "Issuer recommendations, price targets, and comprehensive financial statement analysis.",
    };
}

const DUMMY_REPORTS = [
    { id: 1, title: "Initiating Coverage PT Bank Central Asia Tbk (BBCA): Benteng yang Kokoh", date: "17 Mar 2024", author: "Equity Research Team", type: "Initiating", ticker: "BBCA" },
    { id: 2, title: "Earnings Update PT Telkom Indonesia Tbk (TLKM): Pertumbuhan Data Positif", date: "15 Mar 2024", author: "Analisis Fundamental", type: "Earnings Update", ticker: "TLKM" },
    { id: 3, title: "Review Kinerja PT Astra International Tbk (ASII)", date: "12 Mar 2024", author: "Equity Research Team", type: "Company Update", ticker: "ASII" },
    { id: 4, title: "Prospek PT GoTo Gojek Tokopedia Tbk (GOTO) Pasca Restrukturisasi", date: "10 Mar 2024", author: "Tim Riset Teknologi", type: "Company Update", ticker: "GOTO" },
];

export default async function CompanyResearchPage({ params }: { params: Promise<{ locale?: string }> }) {
    const { locale: rawLocale } = await params;
    const locale: Locale = rawLocale === "en" ? "en" : "id";
    const messages = getMessages(locale);
    const customMessages = {
        ...messages,
        header: { ...messages.header, activeNavKey: "reports" }
    };

    return (
        <MarketPageTemplate locale={locale} messages={customMessages}>
            <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-blue-900 mb-1">
                    {locale === "id" ? "Riset Perusahaan & Ekuitas" : "Company & Equity Research"}
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-2xl">
                    {locale === "id"
                        ? "Pemaparan fundamental emiten, valuasi target harga, kelayakan investasi, dan telaah mendalam laba-rugi operasional."
                        : "Presentation of issuer fundamentals, target price valuation, investment feasibility, and in-depth review of operational profit and loss."}
                </p>
            </div>

            {/* Stock Search Placeholder */}
            <Card className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-white flex flex-col md:flex-row items-center gap-4 border-blue-100">
                <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full text-blue-700">
                    <i className="fa-solid fa-magnifying-glass-chart text-base"></i>
                </div>
                <div className="flex-grow w-full">
                    <h3 className="text-xs font-bold text-slate-700 mb-1.5">Berdasarkan Kode Saham (Ticker)</h3>
                    <div className="relative">
                        <input type="text" placeholder={locale === "id" ? "Ketik nama perusahaan atau kode saham (cth: BBCA)..." : "Type company name or ticker (e.g., BBCA)..."} className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm shadow-sm" disabled />
                        <i className="fa-solid fa-search absolute right-3 top-2.5 text-slate-400"></i>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">* Fitur pencarian aktif bagi pelanggan/user Ebook Portal.</p>
                </div>
                <div className="hidden lg:flex gap-2">
                    <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm cursor-pointer hover:border-blue-300">BBRI</span>
                    <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm cursor-pointer hover:border-blue-300">BMRI</span>
                    <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm cursor-pointer hover:border-blue-300">AMMN</span>
                </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2 mb-6">
                {/* Analyst Recommendation Summary Table */}
                <Card className="flex flex-col overflow-hidden lg:col-span-2">
                    <SectionHeader title={locale === "id" ? "Ringkasan Rekomendasi Saham Pilihan" : "Top Stock Picks Recommendation Summary"} optional={locale === "id" ? "Biro Riset NewsMaker" : "NewsMaker Research Bureau"} />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                                <tr>
                                    <th className="px-5 py-3.5">Kode / Nama Emiten</th>
                                    <th className="px-5 py-3.5">Harga Terakhir</th>
                                    <th className="px-5 py-3.5">Target Harga (12B)</th>
                                    <th className="px-5 py-3.5">Status Valuasi</th>
                                    <th className="px-5 py-3.5 text-center">Rekomendasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-semibold bg-white">
                                <tr className="hover:bg-slate-50 transition cursor-pointer group">
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 text-blue-800 font-black rounded h-8 w-12 flex items-center justify-center text-xs">BBCA</div>
                                            <div>
                                                <span className="block font-bold text-slate-800 group-hover:text-blue-700">Bank Central Asia Tbk</span>
                                                <span className="text-[10px] text-slate-400 tracking-wider">Perbankan</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">Rp 10,050</td>
                                    <td className="px-5 py-2.5 font-bold text-blue-700">Rp 11,500 <i className="fa-solid fa-arrow-trend-up ml-1 text-xs"></i></td>
                                    <td className="px-5 py-2.5"><span className="text-slate-500 font-medium">Batas Aman</span></td>
                                    <td className="px-5 py-2.5 text-center"><span className="bg-emerald-500 text-white px-3 py-1 rounded shadow-sm label-recommendation text-xs tracking-wider uppercase">BUY</span></td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition cursor-pointer group">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 text-blue-800 font-black rounded h-8 w-12 flex items-center justify-center text-xs">ASII</div>
                                            <div>
                                                <span className="block font-bold text-slate-800 group-hover:text-blue-700">Astra Int. Tbk</span>
                                                <span className="text-[10px] text-slate-400 tracking-wider">Otomotif & Multisektor</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">Rp 5,200</td>
                                    <td className="px-5 py-2.5 font-bold text-slate-700">Rp 5,400 <i className="fa-solid fa-minus ml-1 text-xs"></i></td>
                                    <td className="px-5 py-2.5"><span className="text-emerald-600 font-medium tracking-wide">Undervalued</span></td>
                                    <td className="px-5 py-2.5 text-center"><span className="bg-blue-500 text-white px-3 py-1 rounded shadow-sm label-recommendation text-xs tracking-wider uppercase">HOLD</span></td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition cursor-pointer group">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 text-blue-800 font-black rounded h-8 w-12 flex items-center justify-center text-xs">GOTO</div>
                                            <div>
                                                <span className="block font-bold text-slate-800 group-hover:text-blue-700">GoTo Gojek Tokopedia</span>
                                                <span className="text-[10px] text-slate-400 tracking-wider">Teknologi</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">Rp 50</td>
                                    <td className="px-5 py-2.5 font-bold text-rose-700">Rp 45 <i className="fa-solid fa-arrow-trend-down ml-1 text-xs"></i></td>
                                    <td className="px-5 py-2.5"><span className="text-rose-500 font-medium">Overvalued</span></td>
                                    <td className="px-5 py-2.5 text-center"><span className="bg-rose-500 text-white px-3 py-1 rounded shadow-sm label-recommendation text-xs tracking-wider uppercase">SELL</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-slate-50 p-2.5 border-t border-slate-100 text-center">
                        <a href="https://ebook.newsmaker.id/login" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">
                            <i className="fa-solid fa-lock mr-2 text-slate-400"></i> {locale === "id" ? "Login untuk melihat 50+ rekomendasi saham lainnya" : "Login to view 50+ other stock recommendations"}
                        </a>
                    </div>
                </Card>
            </div>

            {/* Latest Equity Reports List */}
            <h3 className="text-base font-bold text-slate-800 mb-3 mt-6 bg-white p-3 rounded-md border border-slate-200">
                <i className="fa-solid fa-building text-blue-600 mr-2 text-sm"></i> {locale === "id" ? "Riset Ekuitas Terbaru" : "Latest Equity Research"}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
                {DUMMY_REPORTS.map((report) => (
                    <Card key={report.id} className="p-3.5 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-2 items-center">
                                    <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black tracking-widest px-2 py-1 rounded">
                                        {report.ticker}
                                    </span>
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase px-2 py-1 rounded">
                                        {report.type}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">
                                    <i className="fa-regular fa-calendar mr-1"></i> {report.date}
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm leading-tight mb-2 group-hover:text-blue-700 transition">
                                {report.title}
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">
                                <i className="fa-solid fa-pen-nib mr-1 text-slate-300"></i> {report.author}
                            </p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <a href="https://ebook.newsmaker.id/login" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1">
                                Detail Target & Valuasi <i className="fa-solid fa-arrow-right"></i>
                            </a>
                            <i className="fa-solid fa-lock text-slate-300 text-sm"></i>
                        </div>
                    </Card>
                ))}
            </div>
        </MarketPageTemplate>
    );
}
