import { NextResponse } from "next/server";
import { getRates } from "@/lib/endpo.server";

export async function GET() {
  const { data } = await getRates();

  if (!data) {
    return NextResponse.json(
      { status: "error", error: "upstream_failed" },
      { status: 502 },
    );
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
