import { NextResponse } from "next/server";

const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v1";

export async function GET() {
  try {
    const response = await fetch(`${FRANKFURTER_BASE_URL}/currencies`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch currencies",
          status: response.status,
        },
        { status: 500 },
      );
    }

    const data = (await response.json()) as Record<string, string>;

    const currencies = Object.entries(data)
      .map(([code, name]) => ({
        code,
        name,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    return NextResponse.json({
      source: "frankfurter",
      count: currencies.length,
      currencies,
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
