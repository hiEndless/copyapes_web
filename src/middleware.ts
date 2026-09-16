import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const MARKETING_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=3600';

const isMarketingPath = (pathname: string) => {
  const normalized = pathname.replace(/^\/(zh-TW|zh|en|ja|ko)(?=\/|$)/, '') || '/';

  if (
    normalized.startsWith('/dashboard') ||
    normalized.startsWith('/incubator/dashboard') ||
    normalized.startsWith('/login') ||
    normalized.startsWith('/register')
  ) {
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

const getLocalePrefix = (pathname: string) => {
  const match = pathname.match(/^\/(zh-TW|zh|en|ja|ko)(?=\/|$)/)

  return match?.[0] ?? ''
}

export default function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const pathname = req.nextUrl.pathname;

  // BFF/API 不做 locale 前缀重定向，否则 /api/* 会被改成 /zh/api/*
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const localePrefix = getLocalePrefix(pathname)
  const normalized = pathname.replace(/^\/(zh-TW|zh|en|ja|ko)(?=\/|$)/, '') || '/'
  
  const isAuthPage = normalized.startsWith('/login') || normalized.startsWith('/register');
  const isDashboardPage = normalized.startsWith('/dashboard') || normalized.startsWith('/incubator/dashboard');

  if (isDashboardPage && !token) {
    req.nextUrl.pathname = `${localePrefix}/login` || '/login';

    return NextResponse.redirect(req.nextUrl);
  } else if (isAuthPage && token) {
    req.nextUrl.pathname = `${localePrefix}/dashboard` || '/dashboard';

    return NextResponse.redirect(req.nextUrl);
  }

  return withMarketingCache(req, intlMiddleware(req));
}

export const config = {
  matcher: ['/', '/(zh-TW|zh|en|ja|ko)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
