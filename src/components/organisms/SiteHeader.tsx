"use client";

import React, { useState } from "react";
import { Button } from "../atoms/Button";

const navItems = [
  "Home",
  "Insight",
  "Markets",
  "Commodities",
  "Equities",
  "Policy",
  "Indonesia Market",
  "Data",
  "Reports",
];

export function SiteHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 text-white shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:py-4 sm:px-0">
        <div className="flex items-center gap-4">
          <a href="/">
            <img
              src="/assets/NewsMaker-23-logo-white.png"
              alt="NewsMaker 23"
              className="h-10 w-auto sm:h-12 lg:h-14"
            />
          </a>
        </div>
        <div className="hidden w-full flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-white/70 sm:flex sm:w-auto sm:justify-end sm:tracking-[0.25em]">
          <div className="flex items-center gap-3">
            <span>EN</span>
            <span className="text-white/40">|</span>
            <span className="hidden sm:inline">Reports</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white/90">
              Register
            </Button>
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
          className="rounded border border-blue-400 p-2 text-white sm:hidden"
          onClick={() => setIsMobileOpen((prev) => !prev)}
        >
          <i className="fa-solid fa-bars text-white"></i>
        </button>
      </div>

      <hr className="border border-white/20" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
        <div
          id="mobile-nav"
          className={`sm:hidden ${isMobileOpen ? "block" : "hidden"}`}
        >
          <div className="pt-3 space-y-3 text-xs uppercase tracking-[0.2em] text-white/70">
            <div className="flex items-center gap-3">
              <span>EN</span>
              <span className="text-white/40">|</span>
              <span>Reports</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-white/90">
                Register
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                className="border-white/40 text-white"
              >
                Menu
              </Button> */}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 pb-3">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  item === "Indonesia Market"
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-white/80 sm:flex sm:flex-wrap sm:justify-between">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className={`relative py-3 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-white/80 after:transition-transform after:duration-200 ${
                item === "Indonesia Market"
                  ? "text-white after:scale-x-100"
                  : "text-white/70 hover:text-white after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
