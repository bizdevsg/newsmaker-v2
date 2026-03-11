import React from "react";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { Card } from "@/components/atoms/Card";
import { getMessages, type Locale } from "@/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = rawLocale === "en" ? "en" : "id";
    const messages = getMessages(locale);
    return {
        title: messages.reports.pages.macro.meta.title,
        description: messages.reports.pages.macro.meta.description,
    };
}

const DUMMY_REPORTS = [
    { id: 1, title: "Prospek Ekonomi Kuartal 3 2024: Bayang-bayang Suku Bunga Global", date: "15 Mar 2024", author: "Biro Riset NewsMaker", type: "Quarterly Outlook" },
    { id: 2, title: "Analisis Dampak Inflasi terhadap Daya Beli Menengah ke Bawah", date: "12 Mar 2024", author: "Tim Riset Ekonomi", type: "Thematic Research" },
    { id: 3, title: "Dinamika Kebijakan The Fed dan Efeknya ke BI Rate", date: "10 Mar 2024", author: "Biro Riset NewsMaker", type: "Monthly Update" },
    { id: 4, title: "Tinjauan Fiskal APBN 2025: Fokus Pembangunan Berlanjut", date: "08 Mar 2024", author: "Tim Riset Makro", type: "Policy Analysis" },
];

export default async function MacroReportsPage({ params }: { params: Promise<{ locale?: string }> }) {
    const { locale: rawLocale } = await params;
    const locale: Locale = rawLocale === "en" ? "en" : "id";
    const messages = getMessages(locale);
    const customMessages = {
        ...messages,
        header: { ...messages.header, activeNavKey: "reports" }
    };

    const t = messages.reports.pages;

    return (
        <MarketPageTemplate locale={locale} messages={customMessages}>
            <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-blue-900 mb-1">
                    {t.macro.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-2xl">
                    {t.macro.description}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mb-6">
                {/* Featured Hero Report */}
                <Card className="flex flex-col overflow-hidden self-start">
                    <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-5 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                            <i className="fa-solid fa-globe text-9xl"></i>
                        </div>
                        <div className="relative z-10 w-full">
                            <span className="inline-block bg-blue-500 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded mb-3">
                                {t.common.featuredLabel}
                            </span>
                            <h3 className="text-lg font-bold leading-tight mb-2">
                                Prospek Pertumbuhan Ekonomi Asia Tenggara 2024
                            </h3>
                            <ul className="mb-5 space-y-1.5 text-sm text-blue-100">
                                <li className="flex items-start gap-2">
                                    <i className="fa-solid fa-check text-emerald-400 mt-0.5"></i>
                                    <span>Inflasi inti diperkirakan stabil di 2.5% - 3.0%.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fa-solid fa-check text-emerald-400 mt-0.5"></i>
                                    <span>Nilai tukar domestik menguat terhadap USD.</span>
                                </li>
                            </ul>
                            <div className="flex items-center gap-3">
                                <a href="https://ebook.newsmaker.id/login" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-900 text-xs font-bold px-3 py-1.5 rounded shadow-md hover:bg-slate-50 transition">
                                    <i className="fa-solid fa-lock mr-2"></i> {t.common.readMore}
                                </a>
                                <button disabled className="bg-blue-800 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded cursor-not-allowed opacity-80" aria-label="PDF Download locked">
                                    <i className="fa-solid fa-file-pdf mr-1"></i> PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Macro Indicators */}
                <Card>
                    <SectionHeader title={t.macro.keyIndicators} />
                    <div className="divide-y divide-slate-100">
                        {[
                            { label: "Suku Bunga BI", value: "6.00%", delta: "Tetap", tone: "neutral" },
                            { label: "Inflasi (YoY)", value: "2.75%", delta: "-0.1%", tone: "down" },
                            { label: "PDB (YoY)", value: "5.05%", delta: "+0.2%", tone: "up" },
                            { label: "Fed Funds Rate", value: "5.50%", delta: "Tetap", tone: "neutral" },
                        ].map((ind, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{ind.label}</p>
                                    <p className="text-sm font-bold text-slate-800">{ind.value}</p>
                                </div>
                                <div className={`text-xs font-bold px-2 py-1 rounded ${ind.tone === "up" ? "bg-emerald-50 text-emerald-600" :
                                    ind.tone === "down" ? "bg-rose-50 text-rose-600" :
                                        "bg-slate-50 text-slate-500"
                                    }`}>
                                    {ind.delta}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Latest Reports List */}
            <h3 className="text-base font-bold text-slate-800 mb-3 mt-6 bg-white p-3 rounded-md border border-slate-200">
                <i className="fa-solid fa-list text-blue-600 mr-2 text-sm"></i> {t.macro.latestTitle}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
                {DUMMY_REPORTS.map((report) => (
                    <Card key={report.id} className="p-3.5 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold uppercase px-2 py-1 rounded">
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
                                {t.macro.readReport} <i className="fa-solid fa-arrow-right"></i>
                            </a>
                            <i className="fa-solid fa-lock text-slate-300 text-sm"></i>
                        </div>
                    </Card>
                ))}
            </div>
        </MarketPageTemplate>
    );
}
