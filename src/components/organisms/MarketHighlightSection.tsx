import React from "react";
import { MarketHighlightItem } from "../molecules/MarketHighlightItem";
import { MarketHighlightCard } from "../molecules/MarketHighlightCard";
import { SectionHeader } from "../molecules/SectionHeader";

const highlightItems = [
  {
    title: "Gold Technical Makes New Level",
    subtitle: "The trading opportunities",
  },
  {
    title: "Potential Markets Under Pressure After China Data",
    subtitle: "The trading opportunities",
  },
  {
    title: "Oil Price Makes Higher Move Under Pressure",
    subtitle: "The trading opportunities",
  },
];

const highlightCards = [
  {
    title: "Morning Notes",
    description: "Snapshot of market moves",
  },
  {
    title: "Market Governance",
    description: "Snapshot of market moves",
  },
  {
    title: "Macro Economics",
    description: "Snapshot of market moves",
  },
];

const highlightTabs = ["Markets", "Aktivitas", "Headlines", "Snapshot"];

export function MarketHighlightSection({ locale, messages }: { locale?: string; messages: any }) {
  const currentHighlightItems = messages?.widgets?.marketHighlight?.items || (locale === "id" ? [
    { title: "Teknikal Emas Mencapai Level Baru", subtitle: "Peluang trading" },
    { title: "Pasar Potensial Tertekan Usai Data China", subtitle: "Peluang trading" },
    { title: "Harga Minyak Bergerak Tinggi Meski Tertekan", subtitle: "Peluang trading" },
  ] : highlightItems);

  const currentHighlightCards = messages?.widgets?.marketHighlight?.cards || (locale === "id" ? [
    { title: "Catatan Pagi", description: "Ringkasan pergerakan pasar" },
    { title: "Tata Kelola Pasar", description: "Ringkasan pergerakan pasar" },
    { title: "Ekonomi Makro", description: "Ringkasan pergerakan pasar" },
  ] : highlightCards);

  return (
    <section className="bg-white rounded-lg shadow">
      <SectionHeader title={messages?.widgets?.marketHighlight?.title || (locale === "id" ? "Sorotan Pasar" : "Market Highlights")} />
      <div className="grid gap-6 px-4 md:px-5 py-4 md:grid-cols-[1.1fr_1.9fr]">
        <div className="flex h-full flex-col">
          {currentHighlightItems.map((item: { title: string, subtitle: string }, index: number) => (
            <MarketHighlightItem
              key={`${item.title}-${index}`}
              title={item.title}
              subtitle={item.subtitle}
              className="flex-1 cursor-pointer"
            />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentHighlightCards.map((card: { title: string, description: string }, index: number) => (
            <MarketHighlightCard
              key={`${card.title}-${index}`}
              title={card.title}
              description={card.description}
              imageSrc="/assets/Screenshot-2024-10-29-at-11.27.48.png"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
