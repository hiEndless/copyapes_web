export type ContentTypeDir = 'blog' | 'tutorials' | 'legal'

export type ContentCategory = 'Blog' | 'tutorial' | 'legal'

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived'

export type TranslationStatus = 'source' | 'machine' | 'reviewed' | 'final'

export type ContentAuthor = {
  name: string
  picture?: string
}

export type ContentMetadata = {
  slug: string
  title: string
  description: string
  category: ContentCategory
  tags?: string[]
  keywords?: string[]
  coverImage?: string
  featured?: boolean
  author?: ContentAuthor
  readTime?: string
  version?: string | number
  sourceLocale?: string
  translationSource?: string
  translationStatus?: TranslationStatus
  publishedAt: string
  updatedAt: string
  status: ContentStatus
}

export type ContentDocument = {
  metadata: ContentMetadata
  content: string
  type: ContentTypeDir
  locale: string
  path: string
}

export type ContentIndexItem = {
  type: ContentTypeDir
  slug: string
  path: string
  featured?: boolean
  locales: Record<string, ContentStatus | string>
}

export type ContentIndex = {
  version: number
  default_locale: string
  supported_locales: string[]
  content_types: ContentTypeDir[]
  items: Record<string, ContentIndexItem>
}

export type AssetManifestEntry = {
  local_path: string
  r2_key: string
  url: string
  sha256: string
  size: number
  content_type: string
  updated_at: string
}

export type AssetManifest = Record<string, AssetManifestEntry>
