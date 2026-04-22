import { NextResponse } from "next/server";
import {
  fetchEconomicCalendar,
  type EconomicCalendarTimeFrame,
} from "@/lib/economic-calendar";
import { buildPublicCacheControl } from "@/lib/server-cache";

const ECONOMIC_CALENDAR_CACHE_CONTROL = buildPublicCacheControl(300, 600);

const isTimeFrame = (value: string): value is EconomicCalendarTimeFrame =>
  value === "today" ||
  value === "this-week" ||
  value === "previous-week" ||
  value === "next-week";

export async function GET(
  _request: Request,
  context: { params: Promise<{ timeFrame: string }> },
) {
  const { timeFrame } = await context.params;
  if (!isTimeFrame(timeFrame)) {
    return NextResponse.json(
      { status: 400, message: "Invalid timeFrame", data: [] },
      { status: 400 },
    );
  }

  const items = (await fetchEconomicCalendar(timeFrame, 200)) ?? [];
  return NextResponse.json(
    { status: 200, message: "OK", data: items },
    {
      status: 200,
      headers: {
        "Cache-Control": ECONOMIC_CALENDAR_CACHE_CONTROL,
      },
    },
  );
}

