import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

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

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/', '/(zh|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};
