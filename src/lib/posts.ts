import { getContentBySlug, listContent, type ContentMetadata } from '@/lib/content'

/** @deprecated Prefer ContentMetadata; kept for blog UI compatibility. */
export type PostMetadata = ContentMetadata & {
  /** Alias of coverImage for existing blog components */
  image?: string
}

export type Post = {
  metadata: PostMetadata
  content: string
}

function toPostMetadata(meta: ContentMetadata): PostMetadata {
  return {
    ...meta,
    image: meta.coverImage
  }
}

export async function getPosts(limit?: number, locale = 'en'): Promise<PostMetadata[]> {
  const posts = await listContent('blog', locale, { limit })

  return posts.map(toPostMetadata)
}

export async function getPostBySlug(slug: string, locale = 'en'): Promise<Post | null> {
  const doc = await getContentBySlug('blog', slug, locale)

  if (!doc) {
    return null
  }

  return {
    metadata: toPostMetadata(doc.metadata),
    content: doc.content
  }
}

export async function getPostMetadata(filepath: string, locale = 'en'): Promise<PostMetadata> {
  const slug = filepath.replace(/\.mdx$/, '')
  const post = await getPostBySlug(slug, locale)

  return post?.metadata ?? { slug, title: slug, description: '', category: 'blog', publishedAt: '', updatedAt: '', status: 'draft', image: undefined }
}
