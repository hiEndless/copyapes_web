import type { Metadata } from 'next'

import { isChineseLocale, localeToOgLocale } from '@/i18n/locales'
import { routing } from '@/i18n/routing'

const DEFAULT_SITE_URL = 'https://copyapes.com'

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
  return isChineseLocale(locale) ? '/images/og-image-zh.png' : '/images/og-image.png'
}

export function buildOgImage(locale: string, alt: string) {
  return {
    url: getOgImagePath(locale),
    ...OG_IMAGE,
    alt
  }
}

export function localeToLanguageTag(locale: string): string {
  switch (locale) {
    case 'zh':
      return 'zh-CN'
    case 'zh-TW':
      return 'zh-TW'
    case 'ja':
      return 'ja'
    case 'ko':
      return 'ko'
    default:
      return 'en-US'
  }
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

export const SITE_ICONS: Metadata['icons'] = {
  icon: [{ url: '/favicon/favicon.ico', type: 'image/x-icon' }],
  apple: [{ url: '/site_logo/logo-small.png', sizes: '180x180', type: 'image/png' }],
  other: [{ url: '/site_logo/logo-small.png', rel: 'apple-touch-icon', sizes: '512x512', type: 'image/png' }]
}

export function buildSocialMetadata(options: {
  locale: string
  path: string
  title: string
  description: string
  siteName: string
}): Pick<Metadata, 'alternates' | 'openGraph' | 'twitter'> {
  const ogImage = buildOgImage(options.locale, options.title)

  return {
    alternates: buildAlternates(options.path, options.locale),
    openGraph: {
      title: options.title,
      description: options.description,
      type: 'website',
      siteName: options.siteName,
      url: getCanonicalUrl(options.path, options.locale),
      locale: localeToOgLocale(options.locale),
      images: [ogImage]
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: [ogImage]
    }
  }
}

export function buildHomePageJsonLd(options: {
  locale: string
  name: string
  description: string
  faqs?: Array<{ question: string; answer: string }>
  dateModified?: string
}) {
  const siteUrl = getSiteUrl()
  const pageUrl = getCanonicalUrl('/', options.locale)
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      name: options.name,
      description: options.description,
      url: siteUrl,
      inLanguage: localeToLanguageTag(options.locale),
      publisher: { '@id': `${siteUrl}#organization` }
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}#organization`,
      name: options.name,
      url: siteUrl,
      logo: `${siteUrl}/site_logo/logo-small.png`,
      description: options.description,
      email: 'service@copyapes.com',
      sameAs: [
        'https://t.me/copyapes_admin',
        'https://t.me/copyapes_cn',
        `${siteUrl}/about`
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'service@copyapes.com',
        contactType: 'customer support'
      }
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: options.name,
      description: options.description,
      isPartOf: { '@id': `${siteUrl}#website` },
      about: { '@id': `${siteUrl}#organization` },
      inLanguage: localeToLanguageTag(options.locale),
      ...(options.dateModified ? { dateModified: options.dateModified } : {})
    }
  ]

  if (options.faqs && options.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      url: `${pageUrl}#faq`,
      isPartOf: { '@id': `${pageUrl}#webpage` },
      mainEntity: options.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  }
}

export function buildBlogPageJsonLd(options: {
  locale: string
  siteName: string
  siteDescription: string
  pageTitle: string
  pageDescription: string
  publishedAt?: string
  updatedAt?: string
  posts?: Array<{
    title: string
    description?: string
    slug: string
    publishedAt?: string
    updatedAt?: string
    authorName?: string
  }>
  faqs?: Array<{ question: string; answer: string }>
}) {
  const siteUrl = getSiteUrl()
  const pageUrl = getCanonicalUrl('/blog', options.locale)
  const aboutUrl = getCanonicalUrl('/about', options.locale)
  const datePublished = toSchemaDate(options.publishedAt)
  const dateModified = toSchemaDate(options.updatedAt || options.publishedAt)

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      name: options.siteName,
      description: options.siteDescription,
      url: siteUrl,
      inLanguage: localeToLanguageTag(options.locale),
      publisher: { '@id': `${siteUrl}#organization` }
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}#organization`,
      name: options.siteName,
      url: siteUrl,
      logo: `${siteUrl}/site_logo/logo-small.png`,
      email: 'service@copyapes.com',
      sameAs: ['https://t.me/copyapes_admin', 'https://t.me/copyapes_cn', aboutUrl]
    },
    {
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#webpage`,
      name: options.pageTitle,
      description: options.pageDescription,
      url: pageUrl,
      inLanguage: localeToLanguageTag(options.locale),
      isPartOf: { '@id': `${siteUrl}#website` },
      about: { '@id': `${siteUrl}#organization` },
      publisher: { '@id': `${siteUrl}#organization` },
      author: { '@id': `${siteUrl}#organization` },
      ...(datePublished ? { datePublished } : {}),
      ...(dateModified ? { dateModified } : {})
    }
  ]

  if (options.posts && options.posts.length > 0) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${pageUrl}#itemlist`,
      name: options.pageTitle,
      numberOfItems: options.posts.length,
      itemListElement: options.posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: getCanonicalUrl(`/blog/${post.slug}`, options.locale),
        name: post.title,
        item: {
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          url: getCanonicalUrl(`/blog/${post.slug}`, options.locale),
          ...(toSchemaDate(post.publishedAt) ? { datePublished: toSchemaDate(post.publishedAt) } : {}),
          ...(toSchemaDate(post.updatedAt || post.publishedAt)
            ? { dateModified: toSchemaDate(post.updatedAt || post.publishedAt) }
            : {}),
          author: post.authorName
            ? { '@type': 'Person', name: post.authorName }
            : { '@id': `${siteUrl}#organization` }
        }
      }))
    })
  }

  if (options.faqs && options.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: options.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  }
}

export function toSchemaDate(value?: string): string | undefined {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
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
  updatedAt?: string
  authorName?: string
  faqs?: Array<{ question: string; answer: string }>
}) {
  const siteUrl = getSiteUrl()
  const pageUrl = getCanonicalUrl(`/blog/${options.slug}`, options.locale)
  const blogUrl = getCanonicalUrl('/blog', options.locale)
  const homeUrl = getCanonicalUrl('/', options.locale)
  const aboutUrl = getCanonicalUrl('/about', options.locale)
  const datePublished = toSchemaDate(options.publishedAt)
  const dateModified = toSchemaDate(options.updatedAt || options.publishedAt)
  const imageUrl = options.image
    ? options.image.startsWith('http')
      ? options.image
      : `${siteUrl}${options.image}`
    : undefined

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      name: options.siteName,
      description: options.siteDescription,
      url: siteUrl,
      inLanguage: localeToLanguageTag(options.locale),
      publisher: { '@id': `${siteUrl}#organization` }
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}#organization`,
      name: options.siteName,
      url: siteUrl,
      logo: `${siteUrl}/site_logo/logo-small.png`,
      sameAs: ['https://t.me/copyapes_admin', 'https://t.me/copyapes_cn', aboutUrl]
    },
    {
      '@type': 'BlogPosting',
      '@id': `${pageUrl}#article`,
      headline: options.title,
      description: options.description,
      url: pageUrl,
      inLanguage: localeToLanguageTag(options.locale),
      ...(imageUrl ? { image: [imageUrl] } : {}),
      ...(datePublished ? { datePublished } : {}),
      ...(dateModified ? { dateModified } : {}),
      author: options.authorName
        ? {
            '@type': 'Person',
            name: options.authorName,
            url: aboutUrl
          }
        : { '@id': `${siteUrl}#organization` },
      publisher: { '@id': `${siteUrl}#organization` },
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

  if (options.faqs && options.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: options.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  }
}

export function buildLegalPageJsonLd(options: {
  locale: string
  siteName: string
  siteDescription: string
  homeLabel: string
  pageTitle: string
  pageDescription: string
  path: '/terms' | '/privacy'
  publishedAt?: string
  updatedAt?: string
  version?: string | number
  faqs?: Array<{ question: string; answer: string }>
}) {
  const siteUrl = getSiteUrl()
  const pageUrl = getCanonicalUrl(options.path, options.locale)
  const homeUrl = getCanonicalUrl('/', options.locale)
  const aboutUrl = getCanonicalUrl('/about', options.locale)
  const datePublished = toSchemaDate(options.publishedAt)
  const dateModified = toSchemaDate(options.updatedAt || options.publishedAt)

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      name: options.siteName,
      description: options.siteDescription,
      url: siteUrl,
      inLanguage: localeToLanguageTag(options.locale),
      publisher: { '@id': `${siteUrl}#organization` }
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}#organization`,
      name: options.siteName,
      url: siteUrl,
      logo: `${siteUrl}/site_logo/logo-small.png`,
      email: 'service@copyapes.com',
      sameAs: ['https://t.me/copyapes_admin', 'https://t.me/copyapes_cn', aboutUrl]
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: options.pageTitle,
      description: options.pageDescription,
      inLanguage: localeToLanguageTag(options.locale),
      isPartOf: { '@id': `${siteUrl}#website` },
      about: { '@id': `${siteUrl}#organization` },
      publisher: { '@id': `${siteUrl}#organization` },
      author: { '@id': `${siteUrl}#organization` },
      ...(datePublished ? { datePublished } : {}),
      ...(dateModified ? { dateModified } : {}),
      ...(options.version ? { version: String(options.version) } : {})
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: options.homeLabel, item: homeUrl },
        { '@type': 'ListItem', position: 2, name: options.pageTitle, item: pageUrl }
      ]
    }
  ]

  if (options.faqs && options.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: options.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  }
}

/** Prefer a distinct description; otherwise derive a short plain excerpt from markdown body. */
export function resolveDocsMetaDescription(
  title: string,
  description: string | undefined,
  content?: string
): string {
  const trimmed = description?.trim()

  if (trimmed && trimmed !== title.trim()) {
    return trimmed
  }

  if (content) {
    const body = content.replace(/^---[\s\S]*?---\s*/, '')
    const excerpt = body
      .split('\n')
      .map(line =>
        line
          .replace(/^#{1,6}\s+/, '')
          .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
          .replace(/[`*_>|-]/g, '')
          .replace(/<[^>]+>/g, '')
          .trim()
      )
      .find(line => line.length >= 24)

    if (excerpt) {
      return excerpt.length > 160 ? `${excerpt.slice(0, 157)}...` : excerpt
    }
  }

  return title
}

export function buildTechArticleJsonLd(options: {
  locale: string
  siteName: string
  siteDescription: string
  homeLabel: string
  docsLabel: string
  title: string
  description: string
  slug: string
  image?: string
  publishedAt?: string
  updatedAt?: string
  keywords?: string[]
  faqs?: Array<{ question: string; answer: string }>
}) {
  const siteUrl = getSiteUrl()
  const pageUrl = getCanonicalUrl(`/docs/${options.slug}`, options.locale)
  const docsUrl = getCanonicalUrl('/docs', options.locale)
  const homeUrl = getCanonicalUrl('/', options.locale)
  const aboutUrl = getCanonicalUrl('/about', options.locale)
  const datePublished = toSchemaDate(options.publishedAt)
  const dateModified = toSchemaDate(options.updatedAt || options.publishedAt)
  const imageUrl = options.image
    ? options.image.startsWith('http')
      ? options.image
      : `${siteUrl}${options.image}`
    : undefined

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      name: options.siteName,
      description: options.siteDescription,
      url: siteUrl,
      inLanguage: localeToLanguageTag(options.locale),
      publisher: { '@id': `${siteUrl}#organization` }
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}#organization`,
      name: options.siteName,
      url: siteUrl,
      logo: `${siteUrl}/site_logo/logo-small.png`,
      sameAs: ['https://t.me/copyapes_admin', 'https://t.me/copyapes_cn', aboutUrl]
    },
    {
      '@type': 'TechArticle',
      '@id': `${pageUrl}#article`,
      headline: options.title,
      name: options.title,
      description: options.description,
      url: pageUrl,
      inLanguage: localeToLanguageTag(options.locale),
      ...(imageUrl ? { image: [imageUrl] } : {}),
      ...(datePublished ? { datePublished } : {}),
      ...(dateModified ? { dateModified } : {}),
      ...(options.keywords?.length ? { keywords: options.keywords.join(', ') } : {}),
      author: { '@id': `${siteUrl}#organization` },
      publisher: { '@id': `${siteUrl}#organization` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
      isPartOf: { '@id': `${docsUrl}#docs` }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: options.homeLabel, item: homeUrl },
        { '@type': 'ListItem', position: 2, name: options.docsLabel, item: docsUrl },
        { '@type': 'ListItem', position: 3, name: options.title, item: pageUrl }
      ]
    }
  ]

  if (options.faqs && options.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: options.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  }
}

export function buildDocsPageJsonLd(options: {
  locale: string
  siteName: string
  siteDescription: string
  pageTitle: string
  pageDescription: string
  docs?: Array<{
    title: string
    description?: string
    slug: string
    publishedAt?: string
    updatedAt?: string
  }>
}) {
  const siteUrl = getSiteUrl()
  const pageUrl = getCanonicalUrl('/docs', options.locale)
  const aboutUrl = getCanonicalUrl('/about', options.locale)

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      name: options.siteName,
      description: options.siteDescription,
      url: siteUrl,
      inLanguage: localeToLanguageTag(options.locale),
      publisher: { '@id': `${siteUrl}#organization` }
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}#organization`,
      name: options.siteName,
      url: siteUrl,
      logo: `${siteUrl}/site_logo/logo-small.png`,
      sameAs: ['https://t.me/copyapes_admin', 'https://t.me/copyapes_cn', aboutUrl]
    },
    {
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#docs`,
      name: options.pageTitle,
      description: options.pageDescription,
      url: pageUrl,
      inLanguage: localeToLanguageTag(options.locale),
      isPartOf: { '@id': `${siteUrl}#website` },
      about: { '@id': `${siteUrl}#organization` },
      publisher: { '@id': `${siteUrl}#organization` }
    }
  ]

  if (options.docs && options.docs.length > 0) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${pageUrl}#itemlist`,
      name: options.pageTitle,
      numberOfItems: options.docs.length,
      itemListElement: options.docs.map((doc, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: getCanonicalUrl(`/docs/${doc.slug}`, options.locale),
        name: doc.title,
        item: {
          '@type': 'TechArticle',
          headline: doc.title,
          description: doc.description,
          url: getCanonicalUrl(`/docs/${doc.slug}`, options.locale),
          ...(toSchemaDate(doc.publishedAt) ? { datePublished: toSchemaDate(doc.publishedAt) } : {}),
          ...(toSchemaDate(doc.updatedAt || doc.publishedAt)
            ? { dateModified: toSchemaDate(doc.updatedAt || doc.publishedAt) }
            : {}),
          author: { '@id': `${siteUrl}#organization` }
        }
      }))
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
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
