import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LANG_COOKIE, LEGACY_EN_SEGMENTS, LOCALES, pickLocale } from "./lib/locales";

// Language routing, model v2 (owner 2026-09-23/25; docs/design-plan.md 2.2).
// Imports only lib/locales.ts, which has no dependencies - proxy runs
// separately from render code.
//   /en/..., /sk/...  -> served as is (app/[lang])
//   /                 -> 307 to the visitor's language: cookie, browser,
//                        country, English. The only URL that looks at them.
//   /grooming/... etc. -> 301 to /en/... (English URLs before v2)
//   anything else     -> 404
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    const locale = pickLocale({
      cookie: request.cookies.get(LANG_COOKIE)?.value,
      acceptLanguage: request.headers.get("accept-language"),
      // Cloudflare sits in front of Vercel: its header has the visitor's
      // country; Vercel's would see Cloudflare's edge.
      country: request.headers.get("cf-ipcountry") ?? request.headers.get("x-vercel-ip-country"),
    });
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/`;
    const response = NextResponse.redirect(url, 307);
    response.headers.set("Vary", "Cookie, Accept-Language, CF-IPCountry");
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const first = pathname.split("/")[1];
  if (LEGACY_EN_SEGMENTS.includes(first)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    url.search = search;
    return NextResponse.redirect(url, 301);
  }

  // Unknown unprefixed URL: let app/global-not-found answer 404.
  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals and any file with an extension
  // (robots.txt, sitemap.xml, llms.txt, favicon.ico, static assets).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
