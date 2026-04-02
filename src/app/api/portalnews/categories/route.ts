import { NextResponse } from "next/server";
import { fetchPortalNewsCategories } from "@/lib/portalnews";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { categories, source } = await fetchPortalNewsCategories();

    return NextResponse.json(
      {
        status: "success",
        source,
        data: categories,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  }
}
