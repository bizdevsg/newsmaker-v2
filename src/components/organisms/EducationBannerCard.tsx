"use client";

import React from "react";
import { SectionHeader } from "../molecules/SectionHeader";

export function EducationBannerCard() {
  return (
    <div className="w-full flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header aligned like typical NewsMaker sections */}
      <SectionHeader title="Education" />
      
      <div className="flex-grow w-full relative overflow-hidden bg-slate-50 group flex flex-col justify-center items-center p-6">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
            opacity: 0.6
          }}
        />

        {/* 
          3D Green Arrow Graphic
          Positioned playfully to pierce behind and in front of the center box.
        */}
        <div className="absolute right-0 bottom-[-5%] md:bottom-[5%] pointer-events-none opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-4 z-20">
          <svg width="220" height="220" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="4" dy="12" stdDeviation="8" floodColor="#000000" floodOpacity="0.4" />
              </filter>
            </defs>
            <g filter="url(#shadow)">
              <path d="M 10,210 L 30,230 L 100,160 L 130,190 L 220,60 L 190,60 L 240,20 L 230,70 L 205,70 L 125,185 L 100,160 L 20,240 Z" fill="url(#arrowGrad)" />
              <path d="M 30,230 L 30,240 L 100,170 L 100,160 Z" fill="#15803d" />
              <path d="M 130,190 L 130,200 L 220,70 L 220,60 Z" fill="#15803d" />
            </g>
          </svg>
        </div>

        {/* Main Content Box (Floating Square) */}
        <a
          href="https://ebook.newsmaker.id/login"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-30 flex flex-col items-center text-center p-6 md:p-8 bg-gradient-to-b from-blue-900 to-blue-800 rounded-2xl shadow-2xl w-[90%] md:w-[85%] border border-blue-600/30 transform transition duration-500 group-hover:-translate-y-2 overflow-hidden mx-auto"
        >
          {/* Subtle inner highlight */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />

          <h3 className="text-xl lg:text-2xl font-black text-white leading-tight mb-4 drop-shadow-md">
            "Trading Lebih Tajam Dimulai dari <span className="text-amber-400">Insight yang Tepat.</span>"
          </h3>

          <p className="text-xs lg:text-sm text-blue-100 mb-8 drop-shadow leading-relaxed">
            Daily eBook & Outlook &mdash; analisis lengkap dan bisa diakses <strong className="text-amber-400 font-bold">gratis!</strong>
          </p>

          <button className="bg-gradient-to-b from-cyan-600 to-blue-700 text-white font-black py-2.5 px-6 lg:px-8 rounded-lg border border-cyan-400/50 shadow-[0_4px_15px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_6px_25px_rgba(6,182,212,0.6)] group-hover:from-cyan-500 w-full md:w-auto relative z-40 active:scale-95">
            Free Download
          </button>
        </a>
      </div>
    </div>
  );
}
