import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { getCanonicalUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map(locale => ({
    url: getCanonicalUrl('/', locale),
    changeFrequency: 'weekly',
    priority: locale === routing.defaultLocale ? 1 : 0.9
  }))
}
