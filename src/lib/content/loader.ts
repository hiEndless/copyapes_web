import matter from 'gray-matter'

import { resolveAssetRef, resolveAssetRefsInMarkdown } from './assets'
import { fetchContentJson, fetchContentText } from './github'
import { DEFAULT_CONTENT_LOCALE, toContentLocale, type ContentLocale } from './locales'
import type {
  ContentDocument,
  ContentIndex,
  ContentIndexItem,
  ContentMetadata,
  ContentStatus,
  ContentTypeDir
} from './types'

function isPublished(status: string | undefined): boolean {
  return status === 'published'
}

function toIsoDateString(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  return ''
}

function normalizeMetadata(data: Record<string, unknown>, slug: string): ContentMetadata {
  const authorRaw = data.author

  let author: ContentMetadata['author']

  if (authorRaw && typeof authorRaw === 'object') {
    const record = authorRaw as Record<string, unknown>
    const name = typeof record.name === 'string' ? record.name : undefined

    if (name) {
      author = {
        name,
        picture: typeof record.picture === 'string' ? record.picture : undefined
      }
    }
  }

  return {
    slug: typeof data.slug === 'string' ? data.slug : slug,
    title: typeof data.title === 'string' ? data.title : slug,
    description: typeof data.description === 'string' ? data.description : '',
    category: (data.category as ContentMetadata['category']) || 'Blog',
    tags: Array.isArray(data.tags) ? data.tags.filter((item): item is string => typeof item === 'string') : undefined,
    keywords: Array.isArray(data.keywords)
      ? data.keywords.filter((item): item is string => typeof item === 'string')
      : undefined,
    coverImage: typeof data.cover_image === 'string' ? data.cover_image : undefined,
    featured: Boolean(data.featured),
    author,
    readTime: typeof data.read_time === 'string' ? data.read_time : undefined,
    version: typeof data.version === 'string' || typeof data.version === 'number' ? data.version : undefined,
    sourceLocale: typeof data.source_locale === 'string' ? data.source_locale : undefined,
    translationSource: typeof data.translation_source === 'string' ? data.translation_source : undefined,
    translationStatus: data.translation_status as ContentMetadata['translationStatus'],
    publishedAt: toIsoDateString(data.published_at),
    updatedAt: toIsoDateString(data.updated_at),
    status: (data.status as ContentStatus) || 'draft'
  }
}

async function hydrateMetadata(metadata: ContentMetadata, locale: ContentLocale): Promise<ContentMetadata> {
  const coverImage = await resolveAssetRef(metadata.coverImage, locale)
  const authorPicture = await resolveAssetRef(metadata.author?.picture, locale)

  return {
    ...metadata,
    coverImage,
    author: metadata.author
      ? {
          ...metadata.author,
          picture: authorPicture
        }
      : undefined
  }
}

export async function getContentIndex(): Promise<ContentIndex> {
  const index = await fetchContentJson<ContentIndex>('content_index.json')

  if (!index) {
    return {
      version: 1,
      default_locale: DEFAULT_CONTENT_LOCALE,
      supported_locales: [DEFAULT_CONTENT_LOCALE],
      content_types: ['legal', 'tutorials', 'blog'],
      items: {}
    }
  }

  return index
}

function pickLocale(
  item: ContentIndexItem,
  preferred: ContentLocale,
  fallback: ContentLocale = DEFAULT_CONTENT_LOCALE
): ContentLocale | null {
  const preferredStatus = item.locales[preferred]

  if (isPublished(preferredStatus)) {
    return preferred
  }

  if (preferred !== fallback && isPublished(item.locales[fallback])) {
    return fallback
  }

  for (const [locale, status] of Object.entries(item.locales)) {
    if (isPublished(status)) {
      return locale as ContentLocale
    }
  }

  return null
}

async function loadDocument(
  type: ContentTypeDir,
  slug: string,
  appLocale: string,
  pathFromIndex?: string
): Promise<ContentDocument | null> {
  const preferred = toContentLocale(appLocale)
  const relativePath = pathFromIndex || `${type}/${slug}.mdx`
  const localesToTry = [...new Set([preferred, DEFAULT_CONTENT_LOCALE])]

  for (const locale of localesToTry) {
    const fullPath = `${locale}/${relativePath}`
    const fileContent = await fetchContentText(fullPath)

    if (!fileContent) {
      continue
    }

    try {
      const { data, content } = matter(fileContent)
      const metadata = normalizeMetadata(data as Record<string, unknown>, slug)

      if (!isPublished(metadata.status)) {
        continue
      }

      const hydrated = await hydrateMetadata(metadata, locale)
      const resolvedContent = await resolveAssetRefsInMarkdown(content, locale)

      return {
        metadata: hydrated,
        content: resolvedContent,
        type,
        locale,
        path: fullPath
      }
    } catch (error) {
      console.error('Failed to parse content document:', fullPath, error)
    }
  }

  return null
}

export async function listContent(
  type: ContentTypeDir,
  appLocale: string,
  options?: { limit?: number; publishedOnly?: boolean }
): Promise<ContentMetadata[]> {
  const index = await getContentIndex()
  const preferred = toContentLocale(appLocale)
  const publishedOnly = options?.publishedOnly ?? true

  const entries = Object.values(index.items).filter(item => item.type === type)

  const docs = (
    await Promise.all(
      entries.map(async item => {
        const locale = pickLocale(item, preferred)

        if (!locale) {
          return null
        }

        if (publishedOnly && !isPublished(item.locales[locale])) {
          return null
        }

        const doc = await loadDocument(type, item.slug, appLocale, item.path)

        if (!doc) {
          return null
        }

        const metadata: ContentMetadata = {
          ...doc.metadata,
          featured: item.featured ?? doc.metadata.featured
        }

        return metadata
      })
    )
  ).filter((item): item is ContentMetadata => item !== null)

  const sorted = docs.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  return options?.limit ? sorted.slice(0, options.limit) : sorted
}

export async function getContentBySlug(
  type: ContentTypeDir,
  slug: string,
  appLocale: string
): Promise<ContentDocument | null> {
  const index = await getContentIndex()
  const key = `${type}/${slug}`
  const item = index.items[key]

  return loadDocument(type, slug, appLocale, item?.path)
}

export async function listTutorialSlugs(appLocale: string): Promise<string[]> {
  const items = await listContent('tutorials', appLocale)

  return items.map(item => item.slug)
}
