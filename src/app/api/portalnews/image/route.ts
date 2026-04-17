import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const DEFAULT_ALLOWED_HOSTS = new Set([
  "portalnews.newsmaker.test",
  "portalnews.newsmaker.id",
  "localhost",
  "127.0.0.1",
]);

const getAllowedHosts = () => {
  const allowedHosts = new Set(DEFAULT_ALLOWED_HOSTS);

  const maybeUrls = [
    process.env.PORTALNEWS_PASAR_INDONESIA_URL,
    process.env.PORTALNEWS_PASAR_INDONESIA_ANALYSIS_URL,
    process.env.PORTALNEWS_IMAGE_BASE,
    process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE,
    process.env.NEXT_PUBLIC_PORTALNEWS_PROXY_HOSTS,
    process.env.PORTALNEWS_PROXY_HOSTS,
  ].filter(Boolean) as string[];

  maybeUrls.forEach((value) => {
    // Allow comma/space separated hostnames in the *_PROXY_HOSTS env vars.
    const parts = value.includes(",") || value.includes(" ")
      ? value.split(/[,\s]+/g).map((entry) => entry.trim()).filter(Boolean)
      : [value];

    parts.forEach((part) => {
      try {
        allowedHosts.add(new URL(part).hostname);
      } catch {
        if (/^[a-z0-9.-]+$/i.test(part)) allowedHosts.add(part);
      }
    });
  });

  return allowedHosts;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url")?.trim() ?? "";

  if (!urlParam) {
    return NextResponse.json(
      { status: "error", message: "Missing url parameter." },
      { status: 400 },
    );
  }

  let url: URL;
  try {
    url = new URL(urlParam);
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid url parameter." },
      { status: 400 },
    );
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return NextResponse.json(
      { status: "error", message: "Unsupported url protocol." },
      { status: 400 },
    );
  }

  const allowedHosts = getAllowedHosts();
  if (!allowedHosts.has(url.hostname)) {
    return NextResponse.json(
      { status: "error", message: "Host is not allowed." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(url.toString(), {
      cache: "no-store",
      next: { revalidate },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { status: "error", message: `Upstream error: ${upstream.status}` },
        { status: 502 },
      );
    }

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    headers.set("cache-control", "public, max-age=300, s-maxage=300");

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
