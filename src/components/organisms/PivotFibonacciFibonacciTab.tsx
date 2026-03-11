"use client";

import React, { useState } from "react";
import type { Messages } from "@/locales";
import { Button } from "../atoms/Button";

type PivotFibonacciFibonacciTabProps = {
  messages: Messages;
};

export function PivotFibonacciFibonacciTab({
  messages,
}: PivotFibonacciFibonacciTabProps) {
  const pfData = messages.policy.pivotFibonacci;
  const [fiboUpInputs, setFiboUpInputs] = useState({ low: "", high: "" });
  const [fiboUpResults, setFiboUpResults] = useState({
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
  });

  const [fiboDownInputs, setFiboDownInputs] = useState({ high: "", low: "" });
  const [fiboDownResults, setFiboDownResults] = useState({
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
  });

  const calculateFiboUp = () => {
    const lowInput = parseFloat(fiboUpInputs.low);
    const highInput = parseFloat(fiboUpInputs.high);
    if ([lowInput, highInput].some((value) => Number.isNaN(value))) return;
    const h = Math.max(lowInput, highInput);
    const l = Math.min(lowInput, highInput);
    const diff = h - l;

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
    const highInput = parseFloat(fiboDownInputs.high);
    const lowInput = parseFloat(fiboDownInputs.low);
    if ([highInput, lowInput].some((value) => Number.isNaN(value))) return;
    const h = Math.max(highInput, lowInput);
    const l = Math.min(highInput, lowInput);
    const diff = h - l;

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

  const formatNum = (num: number) => {
    if (num === 0) return "0.00";
    return num.toFixed(2);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Up Trend Box */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-6">
          {/* Graphic Placeholder */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-md flex-1 flex flex-col items-center justify-center min-h-[220px]">
            <h4 className="text-emerald-500 font-extrabold text-xl tracking-tighter mb-4 flex items-center gap-1">
              {pfData.fibonacci.upTrend}
              <div className="flex -space-x-1">
                <i className="fa-solid fa-arrow-up text-emerald-500 text-lg"></i>
                <i className="fa-solid fa-arrow-up text-emerald-500 text-lg"></i>
                <i className="fa-solid fa-arrow-up text-emerald-500 text-lg"></i>
              </div>
            </h4>
            <div className="relative w-32 h-24 border-l-2 border-b-2 border-slate-300">
              <svg
                viewBox="0 0 100 100"
                className="absolute bottom-0 left-0 w-full h-full overflow-visible"
              >
                <polyline
                  points="0,100 20,60 40,80 70,20 100,0"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="0" cy="100" r="4" fill="#3b82f6" />
                <circle cx="100" cy="0" r="4" fill="#3b82f6" />
                <text x="-5" y="115" fontSize="10" fill="#64748b" fontWeight="bold">
                  A
                </text>
                <text x="105" y="-5" fontSize="10" fill="#64748b" fontWeight="bold">
                  C
                </text>
              </svg>
            </div>
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-4 min-w-[180px] w-full sm:w-auto">
            <div className="space-y-1">
              <label className="text-sm text-slate-600 ml-1">
                {pfData.fibonacci.priceA}
              </label>
              <input
                type="number"
                placeholder={pfData.fibonacci.lowValue}
                value={fiboUpInputs.low}
                onChange={(e) =>
                  setFiboUpInputs({ ...fiboUpInputs, low: e.target.value })
                }
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-600 ml-1">
                {pfData.fibonacci.priceB}
              </label>
              <input
                type="number"
                placeholder={pfData.fibonacci.highValue}
                value={fiboUpInputs.high}
                onChange={(e) =>
                  setFiboUpInputs({ ...fiboUpInputs, high: e.target.value })
                }
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <Button
              onClick={calculateFiboUp}
              variant="primary"
              className="mt-auto py-2.5 px-6 font-medium"
            >
              {pfData.inputs.calculate}
            </Button>
          </div>
        </div>

        {/* Fibonacci UP Tables */}
        <div className="grid grid-cols-2 gap-6">
          <table className="w-full text-left text-sm border border-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th colSpan={2} className="py-2.5 px-3 tracking-tight text-slate-800">
                  {pfData.fibonacci.retracement}
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                Object.keys(fiboUpResults.retracement) as Array<
                  keyof typeof fiboUpResults.retracement
                >
              ).map((pct, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                  <td className="py-2.5 px-3 text-right">
                    {formatNum(fiboUpResults.retracement[pct])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="w-full text-left text-sm border border-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th colSpan={2} className="py-2.5 px-3 tracking-tight text-slate-800">
                  {pfData.fibonacci.projection}
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                Object.keys(fiboUpResults.projection) as Array<
                  keyof typeof fiboUpResults.projection
                >
              ).map((pct, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                  <td className="py-2.5 px-3 text-right">
                    {formatNum(fiboUpResults.projection[pct])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden lg:block border-l border-slate-200 mx-auto w-px h-full absolute left-1/2 -ml-0.5"></div>

      {/* Down Trend Box */}
      <div className="space-y-6 lg:pl-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-6">
          {/* Graphic Placeholder */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-md flex-1 flex flex-col items-center justify-center min-h-[220px]">
            <h4 className="text-red-600 font-extrabold text-xl tracking-tighter mb-4 flex items-center gap-1">
              {pfData.fibonacci.downTrend}
              <div className="flex -space-x-1">
                <i className="fa-solid fa-arrow-down text-red-600 text-lg"></i>
                <i className="fa-solid fa-arrow-down text-red-600 text-lg"></i>
                <i className="fa-solid fa-arrow-down text-red-600 text-lg"></i>
              </div>
            </h4>
            <div className="relative w-32 h-24 border-l-2 border-b-2 border-slate-300">
              <svg
                viewBox="0 0 100 100"
                className="absolute bottom-0 left-0 w-full h-full overflow-visible"
              >
                <polyline
                  points="0,0 20,40 40,20 70,80 100,100"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="0" cy="0" r="4" fill="#3b82f6" />
                <circle cx="100" cy="100" r="4" fill="#3b82f6" />
                <text x="-5" y="-5" fontSize="10" fill="#64748b" fontWeight="bold">
                  A
                </text>
                <text x="105" y="115" fontSize="10" fill="#64748b" fontWeight="bold">
                  C
                </text>
              </svg>
            </div>
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-4 min-w-[180px] w-full sm:w-auto">
            <div className="space-y-1">
              <label className="text-sm text-slate-600 ml-1">
                {pfData.fibonacci.priceA}
              </label>
              <input
                type="number"
                placeholder={pfData.fibonacci.highValue}
                value={fiboDownInputs.high}
                onChange={(e) =>
                  setFiboDownInputs({
                    ...fiboDownInputs,
                    high: e.target.value,
                  })
                }
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-600 ml-1">
                {pfData.fibonacci.priceB}
              </label>
              <input
                type="number"
                placeholder={pfData.fibonacci.lowValue}
                value={fiboDownInputs.low}
                onChange={(e) =>
                  setFiboDownInputs({
                    ...fiboDownInputs,
                    low: e.target.value,
                  })
                }
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              />
            </div>
            <Button
              onClick={calculateFiboDown}
              variant="primary"
              className="mt-auto py-2.5 px-6 font-medium"
            >
              {pfData.inputs.calculate}
            </Button>
          </div>
        </div>

        {/* Fibonacci DOWN Tables */}
        <div className="grid grid-cols-2 gap-6">
          <table className="w-full text-left text-sm border border-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th colSpan={2} className="py-2.5 px-3 tracking-tight text-slate-800">
                  {pfData.fibonacci.retracement}
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                Object.keys(fiboDownResults.retracement) as Array<
                  keyof typeof fiboDownResults.retracement
                >
              ).map((pct, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                  <td className="py-2.5 px-3 text-right">
                    {formatNum(fiboDownResults.retracement[pct])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="w-full text-left text-sm border border-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th colSpan={2} className="py-2.5 px-3 tracking-tight text-slate-800">
                  {pfData.fibonacci.projection}
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                Object.keys(fiboDownResults.projection) as Array<
                  keyof typeof fiboDownResults.projection
                >
              ).map((pct, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="py-2.5 px-3 text-slate-600">{pct}</td>
                  <td className="py-2.5 px-3 text-right">
                    {formatNum(fiboDownResults.projection[pct])}
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
