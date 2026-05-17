import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/zh/dashboard/',
        '/private/',
        '/blog',
        '/zh/blog',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/zh/login',
        '/zh/register',
        '/zh/forgot-password',
        '/zh/reset-password'
      ]
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`
  }
}
