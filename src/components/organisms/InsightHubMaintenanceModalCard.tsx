"use client";

import React from "react";
import Image from "next/image";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import type { Locale } from "@/locales";

type InsightHubMaintenanceModalCardProps = {
  locale: Locale;
  className: string;
  bgCover?: string;
  imageSrc: string;
  imageAlt: string;
};

const MAINTENANCE_SCROLL_LOCK_SOURCE = "insight-hub-maintenance-modal";

export function InsightHubMaintenanceModalCard({
  locale,
  className,
  bgCover,
  imageSrc,
  imageAlt,
}: InsightHubMaintenanceModalCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);

  React.useEffect(() => {
    if (!isOpen) return;

    lockScroll(MAINTENANCE_SCROLL_LOCK_SOURCE);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlockScroll(MAINTENANCE_SCROLL_LOCK_SOURCE);
    };
  }, [closeModal, isOpen]);

  const cardStyle =
    bgCover && bgCover !== "undefined" && bgCover !== "null"
      ? { backgroundImage: `url('${bgCover}')` }
      : undefined;

  return (
    <>
      <button
        type="button"
        className={`${className} w-full cursor-pointer appearance-none bg-transparent p-0 text-left`}
        style={cardStyle}
        aria-label={imageAlt}
        onClick={openModal}
      >
        <div className="relative mx-auto h-[110px] w-full max-w-[340px] sm:h-[120px] md:h-[130px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, 300px"
            className="object-contain p-3 transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={locale === "en" ? "Under maintenance" : "Sedang perbaikan"}
          onClick={closeModal}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 text-center shadow-[0_28px_90px_-24px_rgba(0,0,0,0.45)] sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
                aria-label={locale === "en" ? "Close" : "Tutup"}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                <i className="fa-solid fa-screwdriver-wrench text-2xl"></i>
              </div>

              <h4 className="mt-4 text-lg font-bold text-slate-900">
                {locale === "en" ? "Under Maintenance" : "Sedang Dalam Perbaikan"}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {locale === "en"
                  ? "Sorry, this service is temporarily under maintenance. Please check back again later."
                  : "Mohon maaf, layanan ini sedang dalam perbaikan. Silakan coba lagi beberapa saat lagi."}
              </p>

              <button
                type="button"
                onClick={closeModal}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
              >
                {locale === "en" ? "Got it" : "Mengerti"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
