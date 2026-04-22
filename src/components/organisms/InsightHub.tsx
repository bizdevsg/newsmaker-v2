import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/atoms/Card";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import type { Locale } from "@/locales";

type InsightHubItem = {
  href: string;
  imageSrc: string;
  imageAlt: string;
  bgCover: string;
};

type InsightHubProps = {
  locale: Locale;
  title?: string;
  items?: InsightHubItem[];
};

const DEFAULT_ITEMS = (locale: Locale): InsightHubItem[] => [
  {
    href: "https://gwenstacy.newsmaker.id/",
    imageSrc: "/assets/nmai-logo.png",
    imageAlt: "BBJ Volume",
    bgCover: "/assets/bg-nmai.png",
  },
  {
    href: "https://ebook.newsmaker.id/login",
    imageSrc: "/assets/ebook-logo.png",
    imageAlt: "Live Quotes",
    bgCover: "/assets/bg-ebook.png",
  },
  {
    href: "https://bias23.com/",
    imageSrc: "/assets/logo-bias23.png",
    imageAlt: "Indonesia Market News",
    bgCover: "/assets/bg-bias23.png",
  },
  {
    href: `/${locale}/live-tv`,
    imageSrc: "/assets/logo-livetv.png",
    imageAlt: "Live TV",
    bgCover: "/assets/bg-livetv2.jpg",
  },
];

const normalizeAssetUrl = (value: string) => value.replace(/ /g, "%20");

export function InsightHub({
  locale,
  title = "Insight Hub",
  items,
}: InsightHubProps) {
  const resolvedItems = (items?.length ? items : DEFAULT_ITEMS(locale)).slice(
    0,
    4,
  );

  const isExternalHref = (href: string) =>
    /^(https?:|mailto:|tel:)/i.test(href);

  return (
    <Card>
      <SectionHeader title={title} />
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {resolvedItems.map((item, index) => {
            const href = String(item.href ?? "").trim();
            const bgCover = normalizeAssetUrl(String(item.bgCover ?? ""));
            const imageSrc = normalizeAssetUrl(String(item.imageSrc ?? ""));
            const cardStyle =
              bgCover && bgCover !== "undefined" && bgCover !== "null"
                ? { backgroundImage: `url('${bgCover}')` }
                : undefined;

            const content = (
              <div className="relative mx-auto h-[110px] w-full max-w-[340px] sm:h-[120px] md:h-[130px]">
                <Image
                  src={imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, 300px"
                  className="object-contain p-3 transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            );

            const classes =
              "group flex items-center justify-center rounded border border-slate-200 bg-cover bg-center shadow-sm transition-all hover:border-blue-300";

            if (!href) {
              return (
                <div
                  key={`${item.href}-${index}`}
                  className={`${classes} cursor-not-allowed opacity-60`}
                  style={cardStyle}
                  aria-disabled="true"
                  title={locale === "en" ? "Coming soon" : "Segera hadir"}
                >
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={`${item.href}-${index}`}
                href={href}
                target={isExternalHref(href) ? "_blank" : undefined}
                rel={isExternalHref(href) ? "noopener noreferrer" : undefined}
                className={classes}
                style={cardStyle}
                aria-label={item.imageAlt}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
