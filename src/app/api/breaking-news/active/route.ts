import { NextResponse } from "next/server";
import { getActiveBreakingNews } from "@/lib/breaking-news.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const locale =
    new URL(request.url).searchParams.get("locale") === "en" ? "en" : "id";
  const data = await getActiveBreakingNews(locale);

  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
