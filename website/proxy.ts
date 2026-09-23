import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Locale routing (see lib/i18n.ts). Kept self-contained - proxy runs
// separately from render code.
//   /sk/...  -> served as is (app/[lang] with lang = "sk")
//   /en/...  -> 308 to the unprefixed URL, so English has one canonical URL
//   /...     -> rewritten to /en/... internally
const PREFIXED_LOCALES = ["sk"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PREFIXED_LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next();
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals and any file with an extension
  // (robots.txt, sitemap.xml, llms.txt, favicon.ico, static assets).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
