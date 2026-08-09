import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

import { SUPPORTED_LOCALES } from './locales';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: [...SUPPORTED_LOCALES],
 
  // Used when no locale matches
  defaultLocale: 'en',

  // Hide the prefix for the default locale
  localePrefix: 'as-needed',

  // Keep marketing HTML cacheable: locale comes from URL, not cookies/Accept-Language.
  localeDetection: false,
  localeCookie: false
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
