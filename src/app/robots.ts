import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/seo'
import { routing } from '@/i18n/routing'

const PRIVATE_PATHS = [
  '/dashboard/',
  '/private/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
] as const

/** Explicit Allow-only rules for AI bots (avoids false “blocked” from private Disallow lines). */
const AI_CRAWLERS = [
  'OAI-SearchBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Googlebot',
  'Bingbot',
  'DuckAssistBot',
  'Applebot',
  'ChatGPT-User',
  'Claude-User',
  'Perplexity-User',
  'meta-externalfetcher',
  'MistralAI-User',
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
  'meta-externalagent',
  'Amazonbot',
  'CCBot',
  'Bytespider',
  'cohere-training-data-crawler'
] as const

function localizedPrivatePaths(): string[] {
  const paths = new Set<string>()

  for (const path of PRIVATE_PATHS) {
    paths.add(path)

    for (const locale of routing.locales) {
      if (locale === routing.defaultLocale) {
        continue
      }

      paths.add(`/${locale}${path}`)
    }
  }

  return [...paths]
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: localizedPrivatePaths()
      },
      ...AI_CRAWLERS.map(userAgent => ({
        userAgent,
        allow: '/'
      }))
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`
  }
}
