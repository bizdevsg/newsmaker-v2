"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { Messages } from "@/locales";
import { Button } from "@/components/atoms/Button";
import {
  createNumberFormatter,
  inferDecimalPlaces,
} from "@/lib/number-precision";

type FibonacciTabProps = {
  pfData: Messages["policy"]["pivotFibonacci"];
};

type FiboAnchors = { high: number; low: number };

// Posisi garis level di gambar, dalam persen tinggi gambar. Diukur dari
// fibonacci (1).png dan (3).png; ubah kalau gambarnya diganti. Angkanya
// ditaruh di kolom kanan gambar, sejajar label persen bawaan gambar.
const FIBO_UP_LINES = [
  { ratio: 0, top: 52.8 },
  { ratio: 0.236, top: 59.3 },
  { ratio: 0.382, top: 64.9 },
  { ratio: 0.5, top: 71.4 },
  { ratio: 0.618, top: 77.5 },
  { ratio: 0.786, top: 83.1 },
  { ratio: 1, top: 89.1 },
];

const FIBO_DOWN_LINES = [
  { ratio: 1, top: 34.9 },
  { ratio: 0.786, top: 41.6 },
  { ratio: 0.618, top: 47.3 },
  { ratio: 0.5, top: 53.9 },
  { ratio: 0.382, top: 60.1 },
  { ratio: 0.236, top: 65.7 },
  { ratio: 0, top: 72.5 },
];

function FiboChartLabels({
  lines,
  priceAt,
  format,
}: {
  lines: { ratio: number; top: number }[];
  priceAt: (ratio: number) => number;
  format: (num: number) => string;
}) {
  return (
    <>
      {lines.map(({ ratio, top }) => (
        <span
          key={ratio}
          className="absolute -translate-y-1/2 whitespace-nowrap text-[10px] font-bold leading-none text-slate-800 tabular-nums sm:text-[11px]"
          style={{ top: `${top}%`, left: "100%" }}
        >
          {format(priceAt(ratio))}
        </span>
      ))}
    </>
  );
}

export function FibonacciTab({ pfData }: FibonacciTabProps) {
  const [fiboUpInputs, setFiboUpInputs] = useState({ low: "", high: "" });
  const [fiboDownInputs, setFiboDownInputs] = useState({ high: "", low: "" });
  // Each calculator infers its own precision from its own inputs (e.g. forex
  // "1.1650" vs gold "4600"), rather than a fixed 2 decimals for both.
  const [fiboUpDecimals, setFiboUpDecimals] = useState(2);
  const [fiboDownDecimals, setFiboDownDecimals] = useState(2);
  const [fiboUpAnchors, setFiboUpAnchors] = useState<FiboAnchors | null>(
    null,
  );
  const [fiboDownAnchors, setFiboDownAnchors] = useState<FiboAnchors | null>(
    null,
  );

  const [fiboUpResults, setFiboUpResults] = useState(() => ({
    retracement: {
      "23.60%": 0,
      "38.20%": 0,
      "50.0%": 0,
      "61.80%": 0,
      "78.60%": 0,
    },
    projection: {
      "138.20%": 0,
      "150.00%": 0,
      "161.80%": 0,
      "200.00%": 0,
      "238.20%": 0,
      "261.80%": 0,
    },
  }));

  const [fiboDownResults, setFiboDownResults] = useState(() => ({
    retracement: {
      "78.60%": 0,
      "61.80%": 0,
      "50.0%": 0,
      "38.20%": 0,
      "23.60%": 0,
    },
    projection: {
      "138.20%": 0,
      "150.00%": 0,
      "161.80%": 0,
      "200.00%": 0,
      "238.20%": 0,
      "261.80%": 0,
    },
  }));

  const calculateFiboUp = () => {
    const lowInput = Number(fiboUpInputs.low);
    const highInput = Number(fiboUpInputs.high);
    if (![lowInput, highInput].every(Number.isFinite)) return;

    const h = Math.max(lowInput, highInput);
    const l = Math.min(lowInput, highInput);
    const diff = h - l;

    setFiboUpDecimals(
      inferDecimalPlaces([fiboUpInputs.low, fiboUpInputs.high]),
    );
    setFiboUpAnchors({ high: h, low: l });
    setFiboUpResults({
      retracement: {
        "23.60%": h - 0.236 * diff,
        "38.20%": h - 0.382 * diff,
        "50.0%": h - 0.5 * diff,
        "61.80%": h - 0.618 * diff,
        "78.60%": h - 0.786 * diff,
      },
      projection: {
        "138.20%": h + 0.382 * diff,
        "150.00%": h + 0.5 * diff,
        "161.80%": h + 0.618 * diff,
        "200.00%": h + 1.0 * diff,
        "238.20%": h + 1.382 * diff,
        "261.80%": h + 1.618 * diff,
      },
    });
  };

  const calculateFiboDown = () => {
    const highInput = Number(fiboDownInputs.high);
    const lowInput = Number(fiboDownInputs.low);
    if (![highInput, lowInput].every(Number.isFinite)) return;

    const h = Math.max(highInput, lowInput);
    const l = Math.min(highInput, lowInput);
    const diff = h - l;

    setFiboDownDecimals(
      inferDecimalPlaces([fiboDownInputs.high, fiboDownInputs.low]),
    );
    setFiboDownAnchors({ high: h, low: l });
    setFiboDownResults({
      retracement: {
        "78.60%": l + 0.786 * diff,
        "61.80%": l + 0.618 * diff,
        "50.0%": l + 0.5 * diff,
        "38.20%": l + 0.382 * diff,
        "23.60%": l + 0.236 * diff,
      },
      projection: {
        "138.20%": l - 0.382 * diff,
        "150.00%": l - 0.5 * diff,
        "161.80%": l - 0.618 * diff,
        "200.00%": l - 1.0 * diff,
        "238.20%": l - 1.382 * diff,
        "261.80%": l - 1.618 * diff,
      },
    });
  };

  const formatFiboUpNum = (num: number) =>
    createNumberFormatter(fiboUpDecimals).format(num);
  const formatFiboDownNum = (num: number) =>
    createNumberFormatter(fiboDownDecimals).format(num);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-stretch">
          <div className="flex w-full flex-1 items-center rounded-md border border-slate-100 bg-slate-50 pr-14">
            <div className="relative aspect-square w-full">
              <Image
                src="/assets/fibonacci (1).png"
                alt={pfData.tabs.fibonacci}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
              {fiboUpAnchors ? (
                <FiboChartLabels
                  lines={FIBO_UP_LINES}
                  priceAt={(ratio) =>
                    fiboUpAnchors.high -
                    ratio * (fiboUpAnchors.high - fiboUpAnchors.low)
                  }
                  format={formatFiboUpNum}
                />
              ) : null}
            </div>
          </div>

          <div className="flex w-full min-w-45 flex-col gap-4 sm:w-auto">
            <div className="space-y-1">
              <label className="ml-1 text-sm text-slate-600">
                {pfData.fibonacci.priceA}
              </label>
              <input
                type="number"
                placeholder={pfData.fibonacci.lowValue}
                value={fiboUpInputs.low}
                onChange={(e) =>
                  setFiboUpInputs((prev) => ({
                    ...prev,
                    low: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <div className="space-y-1">
              <label className="ml-1 text-sm text-slate-600">
                {pfData.fibonacci.priceB}
              </label>
              <input
                type="number"
                placeholder={pfData.fibonacci.highValue}
                value={fiboUpInputs.high}
                onChange={(e) =>
                  setFiboUpInputs((prev) => ({
                    ...prev,
                    high: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <Button
              onClick={calculateFiboUp}
              variant="primary"
              className="mt-auto px-6 py-2.5 font-medium"
            >
              {pfData.inputs.calculate}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <table className="w-full border border-slate-200 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th
                  colSpan={2}
                  className="px-3 py-2.5 tracking-tight text-slate-800"
                >
                  {pfData.fibonacci.retracement}
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                Object.keys(fiboUpResults.retracement) as Array<
                  keyof typeof fiboUpResults.retracement
                >
              ).map((pct) => (
                <tr
                  key={pct}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-3 py-2.5 text-slate-600">{pct}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatFiboUpNum(fiboUpResults.retracement[pct])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="w-full border border-slate-200 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th
                  colSpan={2}
                  className="px-3 py-2.5 tracking-tight text-slate-800"
                >
                  {pfData.fibonacci.projection}
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                Object.keys(fiboUpResults.projection) as Array<
                  keyof typeof fiboUpResults.projection
                >
              ).map((pct) => (
                <tr
                  key={pct}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-3 py-2.5 text-slate-600">{pct}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatFiboUpNum(fiboUpResults.projection[pct])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-stretch">
          <div className="flex w-full flex-1 items-center rounded-md border border-slate-100 bg-slate-50 pr-14">
            <div className="relative aspect-square w-full">
              <Image
                src="/assets/fibonacci (3).png"
                alt={pfData.tabs.fibonacci}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
              {fiboDownAnchors ? (
                <FiboChartLabels
                  lines={FIBO_DOWN_LINES}
                  priceAt={(ratio) =>
                    fiboDownAnchors.low +
                    ratio * (fiboDownAnchors.high - fiboDownAnchors.low)
                  }
                  format={formatFiboDownNum}
                />
              ) : null}
            </div>
          </div>

          <div className="flex w-full min-w-45 flex-col gap-4 sm:w-auto">
            <div className="space-y-1">
              <label className="ml-1 text-sm text-slate-600">
                {pfData.fibonacci.priceA}
              </label>
              <input
                type="number"
                placeholder={pfData.fibonacci.highValue}
                value={fiboDownInputs.high}
                onChange={(e) =>
                  setFiboDownInputs((prev) => ({
                    ...prev,
                    high: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <div className="space-y-1">
              <label className="ml-1 text-sm text-slate-600">
                {pfData.fibonacci.priceB}
              </label>
              <input
                type="number"
                placeholder={pfData.fibonacci.lowValue}
                value={fiboDownInputs.low}
                onChange={(e) =>
                  setFiboDownInputs((prev) => ({
                    ...prev,
                    low: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <Button
              onClick={calculateFiboDown}
              variant="primary"
              className="mt-auto px-6 py-2.5 font-medium"
            >
              {pfData.inputs.calculate}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <table className="w-full border border-slate-200 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th
                  colSpan={2}
                  className="px-3 py-2.5 tracking-tight text-slate-800"
                >
                  {pfData.fibonacci.retracement}
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                Object.keys(fiboDownResults.retracement) as Array<
                  keyof typeof fiboDownResults.retracement
                >
              ).map((pct) => (
                <tr
                  key={pct}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-3 py-2.5 text-slate-600">{pct}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatFiboDownNum(fiboDownResults.retracement[pct])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="w-full border border-slate-200 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th
                  colSpan={2}
                  className="px-3 py-2.5 tracking-tight text-slate-800"
                >
                  {pfData.fibonacci.projection}
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                Object.keys(fiboDownResults.projection) as Array<
                  keyof typeof fiboDownResults.projection
                >
              ).map((pct) => (
                <tr
                  key={pct}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-3 py-2.5 text-slate-600">{pct}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatFiboDownNum(fiboDownResults.projection[pct])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

