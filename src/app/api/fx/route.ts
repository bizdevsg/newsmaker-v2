import { NextRequest, NextResponse } from "next/server";

const FRANKFURTER_BASE_URL = process.env.FRANKFURTER_BASE_URL ?? "";

function normalizeCurrency(value: string | null, fallback: string) {
  return (value || fallback).trim().toUpperCase();
}

function parseAmount(value: string | null) {
  if (!value) return 1;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 1;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const from = normalizeCurrency(searchParams.get("from"), "USD");
    const to = normalizeCurrency(searchParams.get("to"), "IDR");
    const amount = parseAmount(searchParams.get("amount"));

    if (from === to) {
      return NextResponse.json({
        source: "frankfurter",
        date: null,
        from,
        to,
        amount,
        rate: 1,
        result: amount,
      });
    }

    const url = `${FRANKFURTER_BASE_URL}/latest?base=${encodeURIComponent(from)}&symbols=${encodeURIComponent(to)}`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch exchange rate",
          status: response.status,
        },
        { status: 500 },
      );
    }

    const data = (await response.json()) as {
      amount?: number;
      base?: string;
      date?: string;
      rates?: Record<string, number>;
    };

    const rate = data?.rates?.[to];

    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      return NextResponse.json(
        {
          error: "Invalid exchange rate payload",
          payload: data,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      source: "frankfurter",
      date: data?.date ?? null,
      from,
      to,
      amount,
      rate,
      result: amount * rate,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
