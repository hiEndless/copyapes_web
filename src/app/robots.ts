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

/** AI search + training crawlers explicitly allowed (same private-path policy as *). */
const AI_CRAWLERS = [
  // Search / answer engines
  'OAI-SearchBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Googlebot',
  'Bingbot',
  'DuckAssistBot',
  'Applebot',
  // User-triggered fetchers
  'ChatGPT-User',
  'Claude-User',
  'Perplexity-User',
  'meta-externalfetcher',
  'MistralAI-User',
  // Training crawlers
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
  const disallow = localizedPrivatePaths()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow
      },
      ...AI_CRAWLERS.map(userAgent => ({
        userAgent,
        allow: '/',
        disallow
      }))
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`
  }
}
