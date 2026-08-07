import type { ContentMetadata } from '@/lib/content'
import { toContentLocale, type ContentLocale } from '@/lib/content/locales'

/** Rubix-style sidebar entry: link, or spacer between groups. */
export type DocsNavItem =
  | {
      title: string
      href: string
      noLink?: true
      heading?: string
      items?: DocsNavItem[]
    }
  | {
      spacer: true
    }

export type DocsPageRoute = {
  href: string
  title: string
  slug: string
}

type DocsDocumentLeaf = { slug: string; heading?: string }

type DocsDocumentGroup = {
  title: string
  noLink: true
  heading?: string
  /** First child href is used as the group path prefix for expand matching. */
  items: DocsDocumentLeaf[]
}

type DocsDocumentEntry = { spacer: true } | DocsDocumentLeaf | DocsDocumentGroup

/** Canonical zh-CN heading -> per-locale labels. */
const DOCS_HEADING_I18N: Record<string, Record<ContentLocale, string>> = {
  介绍: {
    'zh-CN': '介绍',
    'zh-TW': '介紹',
    'en-US': 'Introduction',
    'ja-JP': 'はじめに',
    'ko-KR': '소개'
  },
  申请交易所API: {
    'zh-CN': '申请交易所API',
    'zh-TW': '申請交易所API',
    'en-US': 'Exchange API Setup',
    'ja-JP': '取引所API申請',
    'ko-KR': '거래소 API 신청'
  },
  跟单欧意: {
    'zh-CN': '跟单欧意',
    'zh-TW': '跟單歐意',
    'en-US': 'Copy OKX',
    'ja-JP': 'OKXコピー',
    'ko-KR': 'OKX 카피'
  },
  跟单币安: {
    'zh-CN': '跟单币安',
    'zh-TW': '跟單幣安',
    'en-US': 'Copy Binance',
    'ja-JP': 'Binanceコピー',
    'ko-KR': 'Binance 카피'
  },
  高级跟单功能: {
    'zh-CN': '高级跟单功能',
    'zh-TW': '進階跟單功能',
    'en-US': 'Advanced Copy Trading',
    'ja-JP': '高度なコピー機能',
    'ko-KR': '고급 카피 기능'
  },
  其他: {
    'zh-CN': '其他',
    'zh-TW': '其他',
    'en-US': 'More',
    'ja-JP': 'その他',
    'ko-KR': '기타'
  }
}

function translateDocsLabel(label: string | undefined, locale: ContentLocale): string | undefined {
  if (!label) return undefined

  return DOCS_HEADING_I18N[label]?.[locale] ?? label
}

function entrySlugs(entry: DocsDocumentEntry): string[] {
  if ('spacer' in entry) return []
  if ('items' in entry) return entry.items.map(item => item.slug)

  return [entry.slug]
}

/**
 * Docs sidebar order (rubix `settings/documents.ts` style).
 * `heading` is a group label above that page; titles come from content frontmatter.
 *
 * Flat link (default):
 *   { heading?: string, slug: '...' }
 *
 * Collapsible group + noLink (see commented example below):
 *   { title: '分组名', noLink: true, heading?: string, items: [{ slug }, ...] }
 */
export const Documents: DocsDocumentEntry[] = [
  { heading: '介绍', slug: 'protocol' },
  { slug: 'step' },
  { slug: 'task-info' },
  { spacer: true },
  { heading: '申请交易所API', slug: 'exchange/okx' },
  { slug: 'exchange/binance' },
  { slug: 'exchange/gate' },
  { slug: 'exchange/add' },
  { spacer: true },
  { heading: '跟单欧意', slug: 'okx/open' },
  { slug: 'okx/person' },
  { spacer: true },
  { heading: '跟单币安', slug: 'binance/open' },
  { slug: 'binance/close' },
  { spacer: true },
  { heading: '高级跟单功能', slug: 'vip/bicoin' },
  { slug: 'vip/hot' },
  { slug: 'vip/cookie' },
  { slug: 'vip/ws' },
  { spacer: true },
  // 分组折叠 + noLink 示例（启用时注释掉下方三条扁平项，并解开本段）：
  // {
  //   title: '其他',
  //   noLink: true,
  //   items: [
  //     { slug: 'other/add-cookie' },
  //     { slug: 'other/grab' },
  //     { slug: 'other/partner' }
  //   ]
  // },
  { heading: '其他', slug: 'other/add-cookie' },
  { slug: 'other/grab' },
  { slug: 'other/partner' }
]

const ORDERED_SLUGS = Documents.flatMap(entrySlugs)

function isNavRoute(item: DocsNavItem): item is Extract<DocsNavItem, { title: string; href: string }> {
  return 'title' in item && 'href' in item
}

function sortByNavOrder(tutorials: ContentMetadata[]): ContentMetadata[] {
  const rank = new Map(ORDERED_SLUGS.map((slug, index) => [slug, index]))

  return [...tutorials].sort((a, b) => {
    const ai = rank.get(a.slug) ?? Number.MAX_SAFE_INTEGER
    const bi = rank.get(b.slug) ?? Number.MAX_SAFE_INTEGER

    if (ai !== bi) return ai - bi

    return a.slug.localeCompare(b.slug)
  })
}

/** Build sidebar tree from tutorial metadata using Documents order. */
export function buildDocsNav(tutorials: ContentMetadata[], appLocale = 'zh'): DocsNavItem[] {
  const locale = toContentLocale(appLocale)
  const bySlug = new Map(tutorials.map(item => [item.slug, item]))
  const roots: DocsNavItem[] = []
  const known = new Set(ORDERED_SLUGS)

  for (const entry of Documents) {
    if ('spacer' in entry) {
      if (roots.length && !('spacer' in roots[roots.length - 1])) {
        roots.push({ spacer: true })
      }

      continue
    }

    if ('items' in entry) {
      const children = entry.items
        .map(leaf => {
          const item = bySlug.get(leaf.slug)

          if (!item) return null

          return {
            title: item.title,
            href: `/docs/${item.slug}`,
            ...(leaf.heading
              ? { heading: translateDocsLabel(leaf.heading, locale) }
              : {})
          }
        })
        .filter((item): item is Extract<DocsNavItem, { title: string; href: string }> => Boolean(item))

      if (!children.length) continue

      roots.push({
        title: translateDocsLabel(entry.title, locale) ?? entry.title,
        href: children[0].href,
        noLink: true,
        items: children,
        ...(entry.heading ? { heading: translateDocsLabel(entry.heading, locale) } : {})
      })

      continue
    }

    const item = bySlug.get(entry.slug)

    if (!item) continue

    roots.push({
      title: item.title,
      href: `/docs/${item.slug}`,
      ...(entry.heading ? { heading: translateDocsLabel(entry.heading, locale) } : {})
    })
  }

  const extras = sortByNavOrder(tutorials.filter(item => !known.has(item.slug)))

  if (extras.length && roots.length && !('spacer' in roots[roots.length - 1])) {
    roots.push({ spacer: true })
  }

  for (const item of extras) {
    roots.push({
      title: item.title,
      href: `/docs/${item.slug}`
    })
  }

  return roots
}

export function flattenDocsRoutes(tutorials: ContentMetadata[]): DocsPageRoute[] {
  return sortByNavOrder(tutorials).map(item => ({
    href: `/docs/${item.slug}`,
    title: item.title,
    slug: item.slug
  }))
}

export function getDocsPreviousNext(slug: string, routes: DocsPageRoute[]) {
  const index = routes.findIndex(route => route.slug === slug)

  if (index === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: index > 0 ? routes[index - 1] : null,
    next: index < routes.length - 1 ? routes[index + 1] : null
  }
}

export { isNavRoute }
