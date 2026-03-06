import { NextResponse } from "next/server";

// Cache the response for 5 minutes (300s) to avoid hammering the external API
export const revalidate = 300;

const NEWS_API = "https://portalnews.newsmaker.id/api/v1/berita";
const NEWS_TOKEN = "Bearer EWF-06433b884f930161";
const IMAGE_BASE = "https://portalnews.newsmaker.id/";

export async function GET() {
    try {
        const res = await fetch(NEWS_API, {
            headers: { Authorization: NEWS_TOKEN },
            next: { revalidate: 300 },
        });
        const json = await res.json();
        if (!json?.data) return NextResponse.json({ status: "error" }, { status: 500 });

        // Build a map: category_id → first article thumbnail
        const thumbMap: Record<number, string> = {};
        for (const item of json.data) {
            if (item.category_id && !thumbMap[item.category_id] && item.images?.[0]) {
                thumbMap[item.category_id] = `${IMAGE_BASE}${item.images[0]}`;
            }
        }

        return NextResponse.json({ status: "success", data: thumbMap });
    } catch (err: any) {
        return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
    }
}
