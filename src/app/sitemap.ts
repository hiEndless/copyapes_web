import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { getPosts } from '@/lib/posts'
import { getPosts } from '@/lib/posts'
import { getCanonicalUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts()
  const paths = ['', '/blog', ...posts.map(post => `/blog/${post.slug}`)]

  return paths.flatMap(path =>
    routing.locales.map(locale => ({
      url: getCanonicalUrl(path, locale)
    }))
  )
}
