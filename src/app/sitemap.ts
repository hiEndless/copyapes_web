import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { listContent } from '@/lib/content'
import { getCanonicalUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tutorials] = await Promise.all([listContent('blog', 'en'), listContent('tutorials', 'zh')])

  const paths: Array<{ path: string; lastModified?: string }> = [
    { path: '' },
    { path: '/about' },
    { path: '/privacy' },
    { path: '/terms' },
    { path: '/blog' },
    { path: '/docs' },
    ...posts.map(post => ({
      path: `/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt
    })),
    ...tutorials.map(item => ({
      path: `/docs/${item.slug}`,
      lastModified: item.updatedAt || item.publishedAt
    }))
  ]

  return paths.flatMap(({ path, lastModified }) =>
    routing.locales.map(locale => ({
      url: getCanonicalUrl(path, locale),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: path === '' || path === '/blog' || path === '/docs' ? 'weekly' : 'monthly',
      priority: path === '' ? (locale === routing.defaultLocale ? 1 : 0.9) : path === '/blog' || path === '/docs' ? 0.8 : 0.6
    }))
  )
}
