import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "id"] as const;
const defaultLocale = "id";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocale) {
    const response = NextResponse.next();
    const currentLocale = pathname.split("/")[1];
    response.cookies.set("NEXT_LOCALE", currentLocale);
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set("NEXT_LOCALE", defaultLocale);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|images|robots.txt|sitemap.xml).*)",
  ],
};
