export const SUPPORTED_LOCALES = ['en', 'zh', 'zh-TW', 'ja', 'ko'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_OPTIONS: ReadonlyArray<{
  value: AppLocale
  label: string
  flag: string
}> = [
  { value: 'zh', label: '简体中文', flag: '/images/flags/cn.svg' },
  { value: 'zh-TW', label: '繁體中文', flag: '/images/flags/tw.svg' },
  { value: 'en', label: 'English', flag: '/images/flags/us.svg' },
  { value: 'ja', label: '日本語', flag: '/images/flags/jp.svg' },
  { value: 'ko', label: '한국어', flag: '/images/flags/kr.svg' }
]

export function isChineseLocale(locale: string): boolean {
  return locale === 'zh' || locale === 'zh-TW'
}

export function localeToOgLocale(locale: string): string {
  switch (locale) {
    case 'zh':
      return 'zh_CN'
    case 'zh-TW':
      return 'zh_TW'
    case 'ja':
      return 'ja_JP'
    case 'ko':
      return 'ko_KR'
    default:
      return 'en_US'
  }
}

export function localeToGoogleSignInLocale(locale: string): string {
  switch (locale) {
    case 'zh':
      return 'zh_CN'
    case 'zh-TW':
      return 'zh_TW'
    case 'ja':
      return 'ja'
    case 'ko':
      return 'ko'
    default:
      return 'en'
  }
}
