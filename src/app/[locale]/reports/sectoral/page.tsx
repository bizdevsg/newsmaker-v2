import React from "react";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { Card } from "@/components/atoms/Card";
import { getMessages, type Locale } from "@/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = rawLocale === "en" ? "en" : "id";
    return {
        title: locale === "id" ? "Analisis Sektoral | NewsMaker" : "Sectoral Analysis | NewsMaker",
        description: locale === "id" ? "Riset spesifik mendalam pada berbagai sektor industri." : "In-depth specific research on various industry sectors.",
    };
}

const DUMMY_REPORTS = [
    { id: 1, title: "Laporan Sektor Perbankan: Digitalisasi & Likuiditas", date: "16 Mar 2024", author: "Biro Riset Sektoral", type: "Sector Profile" },
    { id: 2, title: "Sektor Konsumer: Siap Bangkit di Kuartal 3?", date: "14 Mar 2024", author: "Tim Analisis Konsumer", type: "Sector Update" },
    { id: 3, title: "Teknologi & Infrastruktur: Anggaran Baru", date: "11 Mar 2024", author: "Biro Riset Sektoral", type: "Government Policy" },
    { id: 4, title: "Pertambangan Emas & Batubara: Proyeksi Semester II", date: "09 Mar 2024", author: "Tim Analisis Komoditas", type: "Commodity Watch" },
];

export default async function SectoralAnalysisPage({ params }: { params: Promise<{ locale?: string }> }) {
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
                    {locale === "id" ? "Analisis Sektoral" : "Sectoral Analysis"}
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-2xl">
                    {locale === "id"
                        ? "Bandingkan rotasi pasar, pahami peta sentimen industri, dan identifikasi sektor dengan potensi terbaik."
                        : "Compare market rotation, understand the industry sentiment map, and identify sectors with the best potential."}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-6">
                {/* Heatmap/Top Picks Placeholder */}
                <Card className="flex flex-col overflow-hidden">
                    <SectionHeader title={locale === "id" ? "Rotasi Sektor Mingguan" : "Weekly Sector Rotation"}
                        optional={locale === "id" ? "Sentimen Ahli" : "Expert Sentiment"} />
                    <div className="p-3 grid gap-2 flex-grow-0">
                        {[
                            { name: "Energi & Tambang", perf: "+4.2%", bg: "bg-emerald-500" },
                            { name: "Keuangan (Bank)", perf: "+2.1%", bg: "bg-emerald-400" },
                            { name: "Consumer Goods", perf: "+0.5%", bg: "bg-emerald-200" },
                            { name: "Properti", perf: "-1.2%", bg: "bg-rose-300" },
                            { name: "Teknologi", perf: "-3.5%", bg: "bg-rose-500" },
                        ].map((sector, i) => (
                            <div key={i} className="flex justify-between items-center rounded overflow-hidden bg-slate-50 border border-slate-100">
                                <div className="flex w-full">
                                    <div className={`w-3 ${sector.bg}`}></div>
                                    <div className="flex-grow flex justify-between items-center px-3.5 py-1.5 font-bold text-xs text-slate-700">
                                        <span>{sector.name}</span>
                                        <span className={sector.perf.startsWith("+") ? "text-emerald-700" : "text-rose-700"}>{sector.perf}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Top Recommendations Table Placeholder */}
                <Card className="flex flex-col overflow-hidden">
                    <SectionHeader title={locale === "id" ? "Rekomendasi Sektor Teratas" : "Top Sector Recommendations"} />
                    <div className="overflow-x-auto flex-grow">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-2.5">Sektor</th>
                                    <th className="px-4 py-2.5">Rekomendasi</th>
                                    <th className="px-4 py-2.5 text-right">Pergeseran</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                <tr>
                                    <td className="px-4 py-2.5">Perbankan Digital</td>
                                    <td className="px-4 py-2.5"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">Overweight</span></td>
                                    <td className="px-4 py-2.5 text-right text-slate-400"><i className="fa-solid fa-arrow-up text-emerald-500"></i> Upgraded</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2.5">Retail Makanan</td>
                                    <td className="px-4 py-2.5"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">Overweight</span></td>
                                    <td className="px-4 py-2.5 text-right text-slate-400"><i className="fa-solid fa-minus"></i> Maintained</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2.5">Infrastruktur & Tol</td>
                                    <td className="px-4 py-2.5"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Neutral</span></td>
                                    <td className="px-4 py-2.5 text-right text-slate-400"><i className="fa-solid fa-arrow-down text-rose-500"></i> Downgraded</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2.5">Konstruksi BUMN</td>
                                    <td className="px-4 py-2.5"><span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-xs">Underweight</span></td>
                                    <td className="px-4 py-2.5 text-right text-slate-400"><i className="fa-solid fa-minus"></i> Maintained</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-slate-50 p-3 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                        <i className="fa-solid fa-info-circle mr-1"></i> Data diperbarui setiap kuartal berdasarkan kompilasi sentimen analis internal Ebook Portal.
                    </div>
                </Card>
            </div>

            {/* Filter Chips and Latest Reports List */}
            <h3 className="text-base font-bold text-slate-800 mb-3 mt-6 bg-white p-3 rounded-md border border-slate-200 flex items-center justify-between">
                <span><i className="fa-solid fa-industry text-blue-600 mr-2 text-sm"></i> {locale === "id" ? "Riset Menurut Sektor" : "Research by Sector"}</span>
                <div className="hidden sm:flex gap-2 text-xs font-semibold">
                    <button className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full hover:bg-blue-200 transition">Semua</button>
                    <button className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition">Finansial</button>
                    <button className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition">Energi</button>
                    <button className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition">Properti</button>
                </div>
            </h3>

            <div className="grid gap-3 md:grid-cols-2">
                {DUMMY_REPORTS.map((report) => (
                    <Card key={report.id} className="p-3.5 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase px-2 py-1 rounded">
                                    {report.type}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                    <i className="fa-regular fa-calendar mr-1"></i> {report.date}
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm leading-tight mb-2 group-hover:text-blue-700 transition">
                                {report.title}
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">
                                {report.author}
                            </p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <a href="https://ebook.newsmaker.id/login" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1">
                                Baca Analisis <i className="fa-solid fa-arrow-right"></i>
                            </a>
                            <i className="fa-solid fa-lock text-slate-300 text-sm"></i>
                        </div>
                    </Card>
                ))}
            </div>
        </MarketPageTemplate>
    );
}
