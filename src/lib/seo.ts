import type { Metadata } from 'next'

import { routing } from '@/i18n/routing'

const DEFAULT_SITE_URL = 'http://localhost:3000'

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL

  if (url && url.trim() !== '') {
    return url.replace(/\/$/, '')
  }

  return DEFAULT_SITE_URL
}

export function getLocalizedPath(path: string, locale: string): string {
  const normalized = path === '' || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`

  if (locale === routing.defaultLocale) {
    return normalized === '' ? '/' : normalized
  }

  return normalized === '' ? `/${locale}` : `/${locale}${normalized}`
}

export function getCanonicalUrl(path: string, locale: string): string {
  return `${getSiteUrl()}${getLocalizedPath(path, locale)}`
}

const OG_IMAGE = {
  width: 1200,
  height: 630,
  type: 'image/png' as const
}

export function getOgImagePath(locale: string): string {
  return locale === 'zh' ? '/images/og-image-zh.png' : '/images/og-image.png'
}

export function buildOgImage(locale: string, alt: string) {
  return {
    url: getOgImagePath(locale),
    ...OG_IMAGE,
    alt
  }
}

export function localeToLanguageTag(locale: string): string {
  return locale === 'zh' ? 'zh-CN' : 'en-US'
}

export function getLanguageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {}

  for (const locale of routing.locales) {
    alternates[localeToLanguageTag(locale)] = getCanonicalUrl(path, locale)
  }

  alternates['x-default'] = getCanonicalUrl(path, routing.defaultLocale)

  return alternates
}

export function buildAlternates(path: string, locale: string): NonNullable<Metadata['alternates']> {
  return {
    canonical: getCanonicalUrl(path, locale),
    languages: getLanguageAlternates(path)
  }
}

export const NO_INDEX_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: false
}

export function buildWebsiteJsonLd(options: { locale: string; name: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${getSiteUrl()}#website`,
        name: options.name,
        description: options.description,
        url: getSiteUrl(),
        inLanguage: localeToLanguageTag(options.locale)
      }
    ]
  }
}

export function buildBlogPageJsonLd(options: {
  locale: string
  siteName: string
  siteDescription: string
  pageTitle: string
  pageDescription: string
}) {
  const siteUrl = getSiteUrl()
  const pageUrl = getCanonicalUrl('/blog', options.locale)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        name: options.siteName,
        description: options.siteDescription,
        url: siteUrl,
        inLanguage: localeToLanguageTag(options.locale)
      },
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        name: options.pageTitle,
        description: options.pageDescription,
        url: pageUrl,
        isPartOf: { '@id': `${siteUrl}#website` }
      }
    ]
  }
}

export function buildBlogPostingJsonLd(options: {
  locale: string
  siteName: string
  siteDescription: string
  homeLabel: string
  blogLabel: string
  title: string
  description: string
  slug: string
  image?: string
  publishedAt?: string
  authorName?: string
}) {
  const siteUrl = getSiteUrl()
  const pageUrl = getCanonicalUrl(`/blog/${options.slug}`, options.locale)
  const blogUrl = getCanonicalUrl('/blog', options.locale)
  const homeUrl = getCanonicalUrl('/', options.locale)
  const imageUrl = options.image
    ? options.image.startsWith('http')
      ? options.image
      : `${siteUrl}${options.image}`
    : undefined

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        name: options.siteName,
        description: options.siteDescription,
        url: siteUrl,
        inLanguage: localeToLanguageTag(options.locale)
      },
      {
        '@type': 'BlogPosting',
        '@id': `${pageUrl}#article`,
        headline: options.title,
        description: options.description,
        url: pageUrl,
        ...(imageUrl ? { image: [imageUrl] } : {}),
        ...(options.publishedAt ? { datePublished: options.publishedAt } : {}),
        author: options.authorName
          ? { '@type': 'Person', name: options.authorName }
          : { '@type': 'Organization', name: options.siteName },
        publisher: {
          '@type': 'Organization',
          name: options.siteName,
          url: siteUrl
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        isPartOf: { '@id': `${blogUrl}#blog` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: options.homeLabel, item: homeUrl },
          { '@type': 'ListItem', position: 2, name: options.blogLabel, item: blogUrl },
          { '@type': 'ListItem', position: 3, name: options.title, item: pageUrl }
        ]
      }
    ]
  }
}

export function jsonLdScriptProps(data: unknown) {
  return {
    type: 'application/ld+json' as const,
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, '\\u003c')
    }
  }
}
