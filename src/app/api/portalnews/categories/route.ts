import { NextResponse } from "next/server";
import { fetchPortalNewsCategories } from "@/lib/portalnews";

export const revalidate = 300;

export async function GET() {
  try {
    const { categories, source } = await fetchPortalNewsCategories();

    return NextResponse.json({
      status: "success",
      source,
      data: categories,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
