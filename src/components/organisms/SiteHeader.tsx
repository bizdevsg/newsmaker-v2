"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { buildSearchPath } from "@/lib/portalnews-search";
import { getMessages, type Locale } from "@/locales";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";

const decodePathSegment = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export function SiteHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpenDesktop, setIsLangOpenDesktop] = useState(false);
  const [isLangOpenMobile, setIsLangOpenMobile] = useState(false);
  const [mobileNavExpanded, setMobileNavExpanded] = useState<
    Record<string, boolean>
  >({});
  const langDesktopRef = useRef<HTMLDivElement | null>(null);
  const langMobileRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLocale = useMemo(() => {
    const segment = pathname.split("/")[1] || "id";
    return segment === "en" ? "en" : "id";
  }, [pathname]);

  const nextLocale = currentLocale === "en" ? "id" : "en";
  const nextLocaleLabel = nextLocale.toUpperCase();
  const localeFlagClass = currentLocale === "en" ? "fi-gb" : "fi-id";
  const messages = getMessages(currentLocale);
  const searchPlaceholder =
    messages.equities?.newsCategories?.searchPlaceholder || "Search news...";
  const searchButtonLabel =
    messages.equities?.newsCategories?.searchBtn || "Search";
  const siteNavLabels = messages.header.siteNav;
  const currentSearchQuery = useMemo(() => {
    const queryParam = searchParams?.get("q")?.trim();
    if (queryParam) return queryParam;

    const segments = pathname.split("/").filter(Boolean);
    if (segments[1] !== "search" || segments.length <= 2) return "";

    return segments.slice(2).map(decodePathSegment).join(" ");
  }, [pathname, searchParams]);
  const [desktopSearchValue, setDesktopSearchValue] = useState("");
  const [mobileSearchValue, setMobileSearchValue] = useState("");
  const homeHref = `/${currentLocale}`;
  const changeLanguageLabel = messages.header.changeLanguageAria.replace(
    "{locale}",
    nextLocaleLabel,
  );
  const todayLabel = useMemo(() => {
    const locale = currentLocale === "en" ? "en-GB" : "id-ID";
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }, [currentLocale]);

  const normalizedPath = pathname.replace(/\/$/, "") || `/${currentLocale}`;
  const currentQueryString = searchParams?.toString() ?? "";

  const isExternalHref = (href: string) =>
    /^(https?:|mailto:|tel:)/i.test(href);

  const isActiveHref = (href: string, options?: { exact?: boolean }) => {
    if (!href || isExternalHref(href)) return false;

    let parsed: URL;
    try {
      parsed = new URL(href, "http://local");
    } catch {
      return false;
    }

    const hrefPath = parsed.pathname.replace(/\/$/, "") || `/${currentLocale}`;
    const pathMatches = options?.exact
      ? normalizedPath === hrefPath
      : normalizedPath === hrefPath ||
        normalizedPath.startsWith(`${hrefPath}/`);
    if (!pathMatches) return false;

    const hrefQuery = parsed.searchParams.toString();
    if (!hrefQuery) {
      if (options?.exact && currentQueryString) return false;
      return true;
    }

    const currentParams = new URLSearchParams(currentQueryString);
    for (const [key, value] of parsed.searchParams.entries()) {
      if (currentParams.get(key) !== value) return false;
    }
    return true;
  };

  type NavItem = {
    key: string;
    label: string;
    href?: string;
    children?: NavItem[];
  };

  const isNavItemActive = (item: NavItem): boolean => {
    if (item.href && isActiveHref(item.href, { exact: item.key === "home" })) {
      return true;
    }
    if (!item.children?.length) return false;
    return item.children.some(isNavItemActive);
  };

  const navItems = useMemo<NavItem[]>(() => {
    const home = homeHref;
    const routeTo = (path: string) => `${home}/${path.replace(/^\/+/, "")}`;
    const newsTo = (kategori: string, sub?: string) =>
      sub
        ? `${home}/news/${encodeURIComponent(kategori)}/${encodeURIComponent(
            sub,
          )}`
        : `${home}/news/${encodeURIComponent(kategori)}`;

    return [
      { key: "home", label: siteNavLabels.home, href: home },
      {
        key: "market-news",
        label: siteNavLabels.marketNews,
        children: [
          {
            key: "market-news:crypto",
            label: siteNavLabels.crypto,
            href: newsTo("crypto"),
          },
          {
            key: "market-news:index",
            label: siteNavLabels.index,
            href: newsTo("index", "nikkei"),
            children: [
              {
                key: "market-news:index:nikkei",
                label: siteNavLabels.nikkei,
                href: newsTo("index", "nikkei"),
              },
              {
                key: "market-news:index:hangseng",
                label: siteNavLabels.hangseng,
                href: newsTo("index", "hangseng"),
              },
            ],
          },
          {
            key: "market-news:commodity",
            label: siteNavLabels.commodity,
            href: newsTo("commodity", "gold"),
            children: [
              {
                key: "market-news:commodity:gold",
                label: siteNavLabels.gold,
                href: newsTo("commodity", "gold"),
              },
              {
                key: "market-news:commodity:silver",
                label: siteNavLabels.silver,
                href: newsTo("commodity", "silver"),
              },
              {
                key: "market-news:commodity:oil",
                label: siteNavLabels.oil,
                href: newsTo("commodity", "oil"),
              },
            ],
          },
          {
            key: "market-news:currencies",
            label: siteNavLabels.currencies,
            href: newsTo("currencies", "eur-usd"),
            children: [
              {
                key: "market-news:currencies:eur-usd",
                label: siteNavLabels.eurUsd,
                href: newsTo("currencies", "eur-usd"),
              },
              {
                key: "market-news:currencies:usd-jpy",
                label: siteNavLabels.usdJpy,
                href: newsTo("currencies", "usd-jpy"),
              },
              {
                key: "market-news:currencies:usd-chf",
                label: siteNavLabels.usdChf,
                href: newsTo("currencies", "usd-chf"),
              },
              {
                key: "market-news:currencies:aud-usd",
                label: siteNavLabels.audUsd,
                href: newsTo("currencies", "aud-usd"),
              },
              {
                key: "market-news:currencies:gbp-usd",
                label: siteNavLabels.gbpUsd,
                href: newsTo("currencies", "gbp-usd"),
              },
              {
                key: "market-news:currencies:us-dollar",
                label: siteNavLabels.usDollar,
                href: newsTo("currencies", "us-dollar"),
              },
            ],
          },
        ],
      },
      {
        key: "economic-news",
        label: siteNavLabels.economicNews,
        children: [
          {
            key: "economic-news:global-economy",
            label: siteNavLabels.globalEconomy,
            href: routeTo("economic-news/global-economy"),
          },
          {
            key: "economic-news:fiscal-monetary",
            label: siteNavLabels.fiscalMoneter,
            href: routeTo("economic-news/fiscal-monetary"),
          },
        ],
      },
      {
        key: "analysis",
        label: siteNavLabels.analysis,
        children: [
          {
            key: "analysis:market-analysis",
            label: siteNavLabels.marketAnalysis,
            href: routeTo("analysis/market-analysis"),
          },
          {
            key: "analysis:economic-calendar",
            label: siteNavLabels.economicCalendar,
            href: routeTo("analysis/economic-calendar"),
          },
          {
            key: "analysis:opinion",
            label: siteNavLabels.analysisOpinion,
            href: routeTo("analysis/analisis-opinion"),
          },
          {
            key: "analysis:live-chart",
            label: siteNavLabels.liveChart,
            href: routeTo("analysis/live-chart"),
          },
          {
            key: "analysis:education",
            label: siteNavLabels.education,
            href: "https://ebook.newsmaker.id/",
          },
        ],
      },
      {
        key: "indonesia-market",
        label: siteNavLabels.indonesiaMarket,
        href: "https://id-market.newsmaker.id/id",
      },
      {
        key: "tools",
        label: siteNavLabels.tools,
        children: [
          {
            key: "tools:historical-data",
            label: siteNavLabels.historicalData,
            href: routeTo("tools/historical-data"),
          },
          {
            key: "tools:pivot-fibonacci",
            label: siteNavLabels.pivotFibonacci,
            href: routeTo("tools/pivot-fibonacci"),
          },
        ],
      },
    ];
  }, [homeHref, siteNavLabels]);

  const toggleMobileKey = (key: string) => {
    setMobileNavExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setLanguage = (value: string) => {
    const next = value === "en" ? "en" : "id";
    const segments = pathname.split("/");
    segments[1] = next;
    const nextPath = segments.join("/") || `/${next}`;
    const nextSearch = searchParams?.toString();
    router.push(nextSearch ? `${nextPath}?${nextSearch}` : nextPath);
  };

  const submitSearch = (value: string, options?: { closeMobile?: boolean }) => {
    const query = value.trim();

    if (options?.closeMobile) {
      setIsMobileOpen(false);
    }

    router.push(buildSearchPath(currentLocale as Locale, query));
  };

  useEffect(() => {
    if (!isLangOpenDesktop) return;
    const onClick = (event: MouseEvent) => {
      if (!langDesktopRef.current) return;
      if (!langDesktopRef.current.contains(event.target as Node)) {
        setIsLangOpenDesktop(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isLangOpenDesktop]);

  useEffect(() => {
    if (!isLangOpenMobile) return;
    const onClick = (event: MouseEvent) => {
      if (!langMobileRef.current) return;
      if (!langMobileRef.current.contains(event.target as Node)) {
        setIsLangOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isLangOpenMobile]);

  useEffect(() => {
    if (!isMobileOpen) return;

    lockScroll("site-header-mobile-nav");

    return () => {
      unlockScroll("site-header-mobile-nav");
    };
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const nextExpanded: Record<string, boolean> = {};

    const markActiveBranch = (item: NavItem): boolean => {
      if (!item.children?.length) return isNavItemActive(item);

      const anyChildActive = item.children.some(markActiveBranch);
      if (anyChildActive) nextExpanded[item.key] = true;
      return anyChildActive || isNavItemActive(item);
    };

    navItems.forEach(markActiveBranch);
    setMobileNavExpanded((prev) => ({ ...prev, ...nextExpanded }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileOpen, pathname, currentQueryString]);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsLangOpenMobile(false);
    setMobileNavExpanded({});
  }, [pathname]);

  useEffect(() => {
    setDesktopSearchValue(currentSearchQuery);
    setMobileSearchValue(currentSearchQuery);
  }, [currentSearchQuery]);

  return (
    <header className="bg-[#1061B3] text-white shadow-xl">
      <div className="bg-[url(/assets/bg-cover.pg)]" />
      <div className="px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={homeHref}>
              <img
                src="/assets/NewsMaker-White 1.png"
                alt="NewsMaker 23"
                className="h-10 w-auto sm:h-12 lg:h-14"
              />
            </Link>
          </div>
          <div className="hidden w-full flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-white/70 md:flex md:w-auto md:justify-end md:tracking-[0.25em]">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold text-white/70">
                {todayLabel}
              </span>
              <div className="relative" ref={langDesktopRef}>
                <button
                  type="button"
                  onClick={() => setIsLangOpenDesktop((prev) => !prev)}
                  aria-label={changeLanguageLabel}
                  className="relative inline-flex h-7 w-7 items-center justify-center rounded cursor-pointer text-white/90 transition hover:border-white/70"
                >
                  <span
                    className={`fi ${localeFlagClass} h-3 w-4 rounded-sm`}
                  />
                </button>
                {isLangOpenDesktop && (
                  <div className="absolute right-0 mt-2 w-24 rounded-md border border-slate-200 bg-white py-1 text-xs font-semibold text-slate-700 shadow-lg z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("id");
                        setIsLangOpenDesktop(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <span className="fi fi-id h-3 w-4 rounded-sm" />
                      ID
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("en");
                        setIsLangOpenDesktop(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <span className="fi fi-gb h-3 w-4 rounded-sm" />
                      EN
                    </button>
                  </div>
                )}
              </div>
              <span className="text-white/40">|</span>
              <Link
                href={`https://ebook.newsmaker.id/`}
                target="_blank"
                className="hidden sm:inline hover:text-white transition capitalize"
              >
                <Image
                  src="/assets/LOGO NM23 EBOOK-white 2.png"
                  alt="E-Book"
                  width={70}
                  height={16}
                  className="inline mr-1"
                />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <form
                className="relative"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSearch(desktopSearchValue);
                }}
              >
                <input
                  name="q"
                  onChange={(event) =>
                    setDesktopSearchValue(event.target.value)
                  }
                  type="search"
                  placeholder={searchPlaceholder}
                  value={desktopSearchValue}
                  className="w-44 rounded border border-white/40 bg-white/10 px-3 py-1.5 pr-9 text-xs font-semibold text-white placeholder:text-white/60 outline-none transition focus:border-white/70"
                />
                <button
                  aria-label={searchButtonLabel}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[11px] text-white/80"
                  type="submit"
                >
                  <i
                    className="fa-solid fa-magnifying-glass"
                    aria-hidden="true"
                  />
                </button>
              </form>
              {/* <Button
              variant="outline"
              size="sm"
              className="border-white/40 text-white"
            >
              Menu
            </Button> */}
            </div>
          </div>

          <button
            type="button"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav"
            className="rounded border border-blue-400 p-2 text-white md:hidden"
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            <i className="fa-solid fa-bars text-white"></i>
          </button>
        </div>
      </div>

      <div className="border-t border-white/15 bg-[#1061B3] px-4">
        <div className="mx-auto max-w-7xl">
          <nav className="hidden items-center justify-center gap-8 text-sm font-semibold text-white/90 md:flex">
            {navItems.map((item) => {
              const baseLinkClass =
                "relative py-3 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-white/85 after:transition-transform after:duration-200";
              const inactiveClass =
                "text-white/80 hover:text-white after:scale-x-0 hover:after:scale-x-100";
              const activeClass = "text-white after:scale-x-100";
              const itemIsActive = isNavItemActive(item);

              if (!item.children?.length) {
                const href = item.href ?? homeHref;
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={`${baseLinkClass} ${
                      isActiveHref(href, { exact: item.key === "home" })
                        ? activeClass
                        : inactiveClass
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div key={item.key} className="group relative">
                  <button
                    type="button"
                    className={`${baseLinkClass} ${
                      itemIsActive ? activeClass : inactiveClass
                    } flex cursor-pointer items-center gap-2`}
                    aria-haspopup="menu"
                  >
                    <span>{item.label}</span>
                    <i className="fa-solid fa-chevron-down text-[10px] opacity-90" />
                  </button>

                  <div className="invisible absolute left-0 top-full z-50 mt-2 w-64 translate-y-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    {item.children.map((child) => {
                      const hasChildren = Boolean(child.children?.length);

                      if (!hasChildren) {
                        const childHref = child.href ?? homeHref;
                        const childIsActive = isNavItemActive({
                          ...child,
                          href: childHref,
                        });
                        return (
                          <Link
                            key={child.key}
                            href={childHref}
                            className={`flex items-center justify-between px-4 py-2 transition-colors hover:bg-slate-50 hover:text-blue-700 ${
                              childIsActive ? "bg-slate-50 text-blue-700" : ""
                            }`}
                          >
                            <span>{child.label}</span>
                          </Link>
                        );
                      }

                      return (
                        <div key={child.key} className="relative">
                          <button
                            type="button"
                            className={`peer flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-slate-50 hover:text-blue-700 cursor-pointer ${
                              isNavItemActive(child)
                                ? "bg-slate-50 text-blue-700"
                                : ""
                            }`}
                            aria-haspopup="menu"
                          >
                            <span>{child.label}</span>
                            <i className="fa-solid fa-chevron-right text-[10px] opacity-80" />
                          </button>

                          <div className="invisible absolute left-full top-0 z-50 -ml-px w-64 rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 opacity-0 shadow-xl transition-opacity peer-hover:visible peer-hover:opacity-100 peer-focus:visible peer-focus:opacity-100 hover:visible hover:opacity-100 focus-within:visible focus-within:opacity-100">
                            {child.children!.map((leaf) => {
                              const leafHref = leaf.href ?? homeHref;
                              const leafIsActive = isNavItemActive({
                                ...leaf,
                                href: leafHref,
                              });
                              return (
                                <Link
                                  key={leaf.key}
                                  href={leafHref}
                                  className={`block px-4 py-2 transition-colors hover:bg-slate-50 hover:text-blue-700 ${
                                    leafIsActive
                                      ? "bg-slate-50 text-blue-700"
                                      : ""
                                  }`}
                                >
                                  {leaf.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`fixed inset-0 z-50 md:hidden ${
          isMobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isMobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform ${
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <p className="text-base font-semibold text-slate-800">Menu</p>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <div className="relative" ref={langMobileRef}>
                  <button
                    type="button"
                    onClick={() => setIsLangOpenMobile((prev) => !prev)}
                    aria-label={changeLanguageLabel}
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition cursor-pointer hover:border-blue-200 hover:text-blue-700"
                  >
                    <span
                      className={`fi ${localeFlagClass} h-3 w-4 rounded-sm`}
                    />
                  </button>
                  {isLangOpenMobile && (
                    <div className="absolute right-0 mt-2 w-24 rounded-md border border-slate-200 bg-white py-1 text-xs font-semibold text-slate-700 shadow-lg z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage("id");
                          setIsLangOpenMobile(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="fi fi-id h-3 w-4 rounded-sm" />
                        ID
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage("en");
                          setIsLangOpenMobile(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="fi fi-gb h-3 w-4 rounded-sm" />
                        EN
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="bg-blue-500/50 h-fit py-1 px-2 mt-3 rounded">
              <p className="text-[10px] font-semibold uppercase text-slate-800">
                {todayLabel}
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              <Link
                href={`https://ebook.newsmaker.id/`}
                className="flex w-full items-center justify-center rounded-md border border-slate-200 px-3 py-5 hover:bg-blue-50 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
              >
                <Image
                  src="/assets/LOGO NM23 EBOOK 3.png"
                  alt="E-Book"
                  width={100}
                  height={16}
                  className="inline mr-1"
                />
              </Link>
            </div>
            <form
              className="relative mt-3"
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch(mobileSearchValue, { closeMobile: true });
              }}
            >
              <input
                name="q"
                onChange={(event) => setMobileSearchValue(event.target.value)}
                type="search"
                placeholder={searchPlaceholder}
                value={mobileSearchValue}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 pr-9 text-xs font-semibold text-slate-600 placeholder:text-slate-400 outline-none transition focus:border-blue-300"
              />
              <button
                aria-label={searchButtonLabel}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[11px] text-slate-400"
                type="submit"
              >
                <i
                  className="fa-solid fa-magnifying-glass"
                  aria-hidden="true"
                />
              </button>
            </form>
          </div>

          <hr className="border-blue-500/20" />

          <nav className="flex flex-col gap-2 px-4 pb-4 mt-4">
            {navItems.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isExpanded = Boolean(mobileNavExpanded[item.key]);
              const baseItemClass =
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors";
              const activeClass = "bg-blue-100 text-blue-700";
              const inactiveClass =
                "text-slate-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-700";
              const itemIsActive = isNavItemActive(item);

              if (!hasChildren) {
                const href = item.href ?? homeHref;
                return (
                  <Link
                    key={item.key}
                    href={href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`${baseItemClass} ${
                      isActiveHref(href, { exact: item.key === "home" })
                        ? activeClass
                        : inactiveClass
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div key={item.key} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleMobileKey(item.key)}
                    className={`${baseItemClass} ${
                      itemIsActive ? activeClass : inactiveClass
                    } flex w-full cursor-pointer items-center justify-between`}
                    aria-expanded={isExpanded}
                  >
                    <span>{item.label}</span>
                    <i
                      className={`fa-solid fa-chevron-down text-[10px] transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isExpanded ? (
                    <div className="grid gap-2 rounded-lg bg-slate-50 p-2">
                      {item.children!.map((child) => {
                        const childHasChildren = Boolean(
                          child.children?.length,
                        );
                        const childExpanded = Boolean(
                          mobileNavExpanded[child.key],
                        );
                        const childIsActive = isNavItemActive(child);

                        if (!childHasChildren) {
                          const childHref = child.href ?? homeHref;
                          return (
                            <Link
                              key={child.key}
                              href={childHref}
                              onClick={() => setIsMobileOpen(false)}
                              className={`rounded-md bg-white px-3 py-2 text-sm font-semibold transition hover:text-blue-700 ${
                                isNavItemActive({ ...child, href: childHref })
                                  ? "text-blue-700"
                                  : "text-slate-700"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        }

                        return (
                          <div key={child.key} className="space-y-2">
                            <button
                              type="button"
                              onClick={() => toggleMobileKey(child.key)}
                              className={`flex w-full cursor-pointer items-center justify-between rounded-md bg-white px-3 py-2 text-sm font-semibold transition hover:text-blue-700 ${
                                childIsActive
                                  ? "text-blue-700"
                                  : "text-slate-700"
                              }`}
                              aria-expanded={childExpanded}
                            >
                              <span>{child.label}</span>
                              <i
                                className={`fa-solid fa-chevron-down text-[10px] transition-transform ${
                                  childExpanded ? "rotate-180" : ""
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                            {childExpanded ? (
                              <div className="grid gap-2 rounded-md bg-white/70 p-2">
                                {child.children!.map((leaf) => {
                                  const leafHref = leaf.href ?? homeHref;
                                  const leafIsActive = isNavItemActive({
                                    ...leaf,
                                    href: leafHref,
                                  });
                                  return (
                                    <Link
                                      key={leaf.key}
                                      href={leafHref}
                                      onClick={() => setIsMobileOpen(false)}
                                      className={`rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-white hover:text-blue-700 ${
                                        leafIsActive
                                          ? "bg-white text-blue-700"
                                          : "text-slate-700"
                                      }`}
                                    >
                                      {leaf.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </aside>
      </div>
    </header>
  );
}
