import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { getPosts } from '@/lib/posts'
import { getCanonicalUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts()
  const paths: Array<{ path: string; lastModified?: string }> = [
    { path: '' },
    { path: '/privacy' },
    { path: '/blog' },
    ...posts.map(post => ({
      path: `/blog/${post.slug}`,
      lastModified: post.publishedAt
    }))
  ]

  return paths.flatMap(({ path, lastModified }) =>
    routing.locales.map(locale => ({
      url: getCanonicalUrl(path, locale),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: path === '' || path === '/blog' ? 'weekly' : 'monthly',
      priority: path === '' ? (locale === routing.defaultLocale ? 1 : 0.9) : path === '/blog' ? 0.8 : 0.6
    }))
  )
}
