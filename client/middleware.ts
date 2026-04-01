import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

 
const intlMiddleware = createMiddleware(routing);

const PUBLIC_ROUTES_ONLY = ['/login', '/register'];
const PROTECTED_ROUTES = ['/dashboard'];

function getToken(request: NextRequest): string | undefined {
  return request.cookies.get('auth-token')?.value;
}

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = stripLocale(pathname);
  const token = getToken(request);

  const isPublicOnly = PUBLIC_ROUTES_ONLY.some(r => path.startsWith(r));
  const isProtected = PROTECTED_ROUTES.some(r => path.startsWith(r));

  if (token && isPublicOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!token && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

 
export const config = {
  // Match all pathnames except API routes, static files, and Next.js internals
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};