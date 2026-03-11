"use client";

import React, { useState } from "react";
import type { Messages } from "@/locales";
import { Button } from "../atoms/Button";

type PivotFibonacciPivotTabProps = {
  messages: Messages;
};

export function PivotFibonacciPivotTab({
  messages,
}: PivotFibonacciPivotTabProps) {
  const pfData = messages.policy.pivotFibonacci;
  const [pivotInputs, setPivotInputs] = useState({
    open: "",
    high: "",
    low: "",
    close: "",
  });
  const [pivotResults, setPivotResults] = useState({
    classic: { r4: 0, r3: 0, r2: 0, r1: 0, p: 0, s1: 0, s2: 0, s3: 0, s4: 0 },
    woodie: { r4: 0, r3: 0, r2: 0, r1: 0, p: 0, s1: 0, s2: 0, s3: 0, s4: 0 },
    camarilla: { r4: 0, r3: 0, r2: 0, r1: 0, p: 0, s1: 0, s2: 0, s3: 0, s4: 0 },
  });

  const calculatePivot = () => {
    const o = parseFloat(pivotInputs.open);
    const h = parseFloat(pivotInputs.high);
    const l = parseFloat(pivotInputs.low);
    const c = parseFloat(pivotInputs.close);
    if ([o, h, l, c].some((value) => Number.isNaN(value))) return;

    const range = h - l;

    // Classic
    const cp = (h + l + c) / 3;
    const cr1 = 2 * cp - l;
    const cs1 = 2 * cp - h;
    const cr2 = cp + range;
    const cs2 = cp - range;
    const cr3 = h + 2 * (cp - l);
    const cs3 = l - 2 * (h - cp);
    const cr4 = cr2 + range * 1.618;
    const cs4 = cs2 - range * 1.618;

    // Woodie
    const wp = (h + l + 2 * o) / 4;
    const wr1 = 2 * wp - l;
    const ws1 = 2 * wp - h;
    const wr2 = wp + range;
    const ws2 = wp - range;
    const wr3 = h + 2 * (wp - l);
    const ws3 = l - 2 * (h - wp);
    const wr4 = wr3 + range;
    const ws4 = ws3 - range;

    // Camarilla
    const camP = cp;
    const camR4 = c + (range * 1.1) / 2;
    const camR3 = c + (range * 1.1) / 4;
    const camR2 = c + (range * 1.1) / 6;
    const camR1 = c + (range * 1.1) / 12;
    const camS1 = c - (range * 1.1) / 12;
    const camS2 = c - (range * 1.1) / 6;
    const camS3 = c - (range * 1.1) / 4;
    const camS4 = c - (range * 1.1) / 2;

    setPivotResults({
      classic: {
        r4: cr4,
        r3: cr3,
        r2: cr2,
        r1: cr1,
        p: cp,
        s1: cs1,
        s2: cs2,
        s3: cs3,
        s4: cs4,
      },
      woodie: {
        r4: wr4,
        r3: wr3,
        r2: wr2,
        r1: wr1,
        p: wp,
        s1: ws1,
        s2: ws2,
        s3: ws3,
        s4: ws4,
      },
      camarilla: {
        r4: camR4,
        r3: camR3,
        r2: camR2,
        r1: camR1,
        p: camP,
        s1: camS1,
        s2: camS2,
        s3: camS3,
        s4: camS4,
      },
    });
  };

  const formatNum = (num: number) => {
    if (num === 0) return "0.00";
    return num.toFixed(2);
  };

  return (
    <div className="space-y-8">
      {/* Inputs */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[120px]">
          <label className="sr-only">{pfData.inputs.open}</label>
          <input
            type="number"
            placeholder={pfData.inputs.open}
            value={pivotInputs.open}
            onChange={(e) =>
              setPivotInputs({ ...pivotInputs, open: e.target.value })
            }
            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="sr-only">{pfData.inputs.high}</label>
          <input
            type="number"
            placeholder={pfData.inputs.high}
            value={pivotInputs.high}
            onChange={(e) =>
              setPivotInputs({ ...pivotInputs, high: e.target.value })
            }
            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="sr-only">{pfData.inputs.low}</label>
          <input
            type="number"
            placeholder={pfData.inputs.low}
            value={pivotInputs.low}
            onChange={(e) =>
              setPivotInputs({ ...pivotInputs, low: e.target.value })
            }
            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="sr-only">{pfData.inputs.close}</label>
          <input
            type="number"
            placeholder={pfData.inputs.close}
            value={pivotInputs.close}
            onChange={(e) =>
              setPivotInputs({ ...pivotInputs, close: e.target.value })
            }
            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
          />
        </div>
        <div className="col-span-2 md:col-span-1 md:w-auto">
          <Button
            onClick={calculatePivot}
            variant="primary"
            className="w-full md:w-auto font-medium py-2 px-6"
          >
            {pfData.inputs.calculate}
          </Button>
        </div>
      </div>

      {/* Pivot Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead>
            <tr className="border-b-2 border-slate-100">
              <th className="py-3 px-4 font-bold w-32"></th>
              <th className="py-3 px-4 font-bold">
                {pfData.pivot.columns[0]}
              </th>
              <th className="py-3 px-4 font-bold">
                {pfData.pivot.columns[1]}
              </th>
              <th className="py-3 px-4 font-bold">
                {pfData.pivot.columns[2]}
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                k: "R4",
                c: pivotResults.classic.r4,
                w: pivotResults.woodie.r4,
                cam: pivotResults.camarilla.r4,
              },
              {
                k: "R3",
                c: pivotResults.classic.r3,
                w: pivotResults.woodie.r3,
                cam: pivotResults.camarilla.r3,
              },
              {
                k: "R2",
                c: pivotResults.classic.r2,
                w: pivotResults.woodie.r2,
                cam: pivotResults.camarilla.r2,
              },
              {
                k: "R1",
                c: pivotResults.classic.r1,
                w: pivotResults.woodie.r1,
                cam: pivotResults.camarilla.r1,
              },
              {
                k: "Pivot",
                c: pivotResults.classic.p,
                w: pivotResults.woodie.p,
                cam: pivotResults.camarilla.p,
              },
              {
                k: "S1",
                c: pivotResults.classic.s1,
                w: pivotResults.woodie.s1,
                cam: pivotResults.camarilla.s1,
              },
              {
                k: "S2",
                c: pivotResults.classic.s2,
                w: pivotResults.woodie.s2,
                cam: pivotResults.camarilla.s2,
              },
              {
                k: "S3",
                c: pivotResults.classic.s3,
                w: pivotResults.woodie.s3,
                cam: pivotResults.camarilla.s3,
              },
              {
                k: "S4",
                c: pivotResults.classic.s4,
                w: pivotResults.woodie.s4,
                cam: pivotResults.camarilla.s4,
              },
            ].map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 px-4 font-semibold text-slate-800">
                  {row.k}
                </td>
                <td className="py-3 px-4 font-bold">{formatNum(row.c)}</td>
                <td className="py-3 px-4 font-bold">{formatNum(row.w)}</td>
                <td className="py-3 px-4 font-bold text-slate-600">
                  {formatNum(row.cam)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
