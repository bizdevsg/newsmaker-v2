import React from "react";

export function TikTokEmbedCard() {
  return (
    <section className="rounded-lg bg-white shadow overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-blue-800">Video on TikTok</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="grid h-6 w-6 place-items-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Add video"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="grid h-6 w-6 place-items-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Next video"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 pt-2">
        <div className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-2xl bg-slate-900">
          <div className="aspect-[9/16] w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-800/40 via-slate-900 to-slate-900" />
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-black">
                <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
                  <path
                    d="M14.5 4.2c.6 1.6 2 3 3.6 3.6v3.1c-1.3 0-2.5-.4-3.6-1v5.3a4.5 4.5 0 11-4.5-4.5c.3 0 .6 0 .9.1v3.1a1.6 1.6 0 10 1.6 1.6V4.2h2z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              TikTok
            </div>

            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                    <path
                      d="M9 6l9 6-9 6V6z"
                      fill="currentColor"
                      className="text-slate-900"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/65 px-3 py-2 text-[11px] text-white">
              @marketnews · 0:33
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-slate-500">
          Short market clip highlight
        </div>
      </div>
    </section>
  );
}
