import type { AppLocale } from '@/i18n/locales'

export const CONTENT_LOCALES = ['zh-CN', 'zh-TW', 'en-US', 'ja-JP', 'ko-KR'] as const

export type ContentLocale = (typeof CONTENT_LOCALES)[number]

export const DEFAULT_CONTENT_LOCALE: ContentLocale = 'zh-CN'

const APP_TO_CONTENT_LOCALE: Record<AppLocale, ContentLocale> = {
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR'
}

export function toContentLocale(appLocale: string): ContentLocale {
  return APP_TO_CONTENT_LOCALE[appLocale as AppLocale] ?? DEFAULT_CONTENT_LOCALE
}
