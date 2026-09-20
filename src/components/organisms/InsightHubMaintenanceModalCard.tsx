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
  /** Product name used in the apology text, e.g. "NM Ai". */
  productName: string;
};

const MAINTENANCE_SCROLL_LOCK_SOURCE = "insight-hub-maintenance-modal";

export function InsightHubMaintenanceModalCard({
  locale,
  className,
  bgCover,
  imageSrc,
  imageAlt,
  productName,
}: InsightHubMaintenanceModalCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);

  React.useEffect(() => {
    if (!isOpen) return;

    lockScroll(MAINTENANCE_SCROLL_LOCK_SOURCE);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
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

  const title = locale === "en" ? "Under Maintenance" : "Sedang Dalam Perbaikan";

  return (
    <>
      <button
        type="button"
        className={`${className} w-full cursor-pointer appearance-none bg-transparent p-0 text-left`}
        style={cardStyle}
        aria-label={imageAlt}
        aria-haspopup="dialog"
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
          aria-label={title}
          onClick={closeModal}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-center shadow-[0_28px_90px_-24px_rgba(0,0,0,0.75)] sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg leading-none text-slate-600 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/60 cursor-pointer"
                aria-label={locale === "en" ? "Close" : "Tutup"}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-500 ring-8 ring-amber-50">
                <i
                  className="fa-solid fa-screwdriver-wrench text-3xl"
                  aria-hidden="true"
                ></i>
              </div>

              <h4 className="mt-5 text-xl font-bold tracking-[-0.02em] text-slate-900">
                {title}
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {locale === "en"
                  ? `We're sorry, ${productName} is currently under maintenance. We're working on improvements and it will be back soon. Thank you for your understanding.`
                  : `Mohon maaf, ${productName} sedang dalam perbaikan. Kami sedang melakukan peningkatan layanan dan akan segera kembali. Terima kasih atas pengertiannya.`}
              </p>

              <button
                type="button"
                onClick={closeModal}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#1061B3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d4f93] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/60 cursor-pointer"
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
