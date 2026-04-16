"use client";

import React, { useMemo, useState } from "react";
import type { Messages } from "@/locales";
import { PivotTab } from "@/components/organisms/pivot-fibonacci/PivotTab";
import { FibonacciTab } from "@/components/organisms/pivot-fibonacci/FibonacciTab";

type PivotFibonacciClientProps = {
  messages: Messages;
  locale: string;
};

export function PivotFibonacciClient({
  messages,
  locale,
}: PivotFibonacciClientProps) {
  const pfData = messages.policy.pivotFibonacci;
  const [subTab, setSubTab] = useState<"pivot" | "fibonacci">("pivot");

  const numberFormatter = useMemo(() => {
    const localeStr = locale === "id" ? "id-ID" : "en-US";
    return new Intl.NumberFormat(localeStr, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [locale]);

  const formatNum = (num: number) => numberFormatter.format(num);

  return (
    <div className="mt-6 animate-in fade-in duration-500">
      <div className="mb-6 flex items-center border-b border-slate-200">
        <button
          type="button"
          onClick={() => setSubTab("pivot")}
          className={`relative px-4 py-2 w-full text-sm font-semibold rounded-t-xl overflow-hidden transition ${subTab === "pivot" ? "bg-white shadow text-blue-700" : "text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-blue-600"}`}
        >
          {pfData.tabs.pivot}
          {subTab === "pivot" ? (
            <>
              <div className="absolute left-0 bottom-0 h-0.5 w-full bg-blue-700" />
            </>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setSubTab("fibonacci")}
          className={`relative px-4 py-2 w-full text-sm font-semibold rounded-t-xl overflow-hidden transition ${subTab === "fibonacci" ? "bg-white shadow text-blue-700" : "text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-blue-600"}`}
        >
          {pfData.tabs.fibonacci}
          {subTab === "fibonacci" ? (
            <>
              <div className="absolute left-0 bottom-0 h-0.5 w-full bg-blue-700" />
            </>
          ) : null}
        </button>
      </div>

      {subTab === "pivot" ? (
        <PivotTab pfData={pfData} formatNum={formatNum} />
      ) : (
        <FibonacciTab pfData={pfData} formatNum={formatNum} />
      )}
    </div>
  );
}
