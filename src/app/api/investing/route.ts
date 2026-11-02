import { NextResponse } from "next/server";
import { getInvesting } from "@/lib/endpo.server";

export async function GET() {
  const { data } = await getInvesting();

  if (!data) {
    return NextResponse.json(
      { error: "Failed to fetch investing data" },
      { status: 502 },
    );
  }

  return NextResponse.json(data);
}
