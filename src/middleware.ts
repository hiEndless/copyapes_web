import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const MARKETING_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=3600';

const isMarketingPath = (pathname: string) => {
  const normalized = pathname.replace(/^\/(zh-TW|zh|en|ja|ko)(?=\/|$)/, '') || '/';

  if (normalized.startsWith('/dashboard') || normalized.startsWith('/login') || normalized.startsWith('/register')) {
    return false
  }

  if (normalized.startsWith('/api') || normalized.startsWith('/_next')) {
    return false
  }

  return true
}

const withMarketingCache = (req: NextRequest, res: NextResponse) => {
  if (req.cookies.get('token')?.value) {
    return res
  }

  if (!isMarketingPath(req.nextUrl.pathname)) {
    return res
  }

  if (res.headers.has('set-cookie')) {
    return res
  }

  res.headers.set('Cache-Control', MARKETING_CACHE_CONTROL)

  return res
}

export default function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const pathname = req.nextUrl.pathname;
  
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
  const isDashboardPage = pathname.includes('/dashboard');

  if (isDashboardPage && !token) {
    req.nextUrl.pathname = pathname.replace('/dashboard', '/login');

    return NextResponse.redirect(req.nextUrl);
  } else if (isAuthPage && token) {
    req.nextUrl.pathname = pathname.replace('/login', '/dashboard').replace('/register', '/dashboard');

    return NextResponse.redirect(req.nextUrl);
  }

  return withMarketingCache(req, intlMiddleware(req));
}

export const config = {
  matcher: ['/', '/(zh-TW|zh|en|ja|ko)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};
