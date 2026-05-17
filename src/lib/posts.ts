import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import matter from 'gray-matter'

export type Post = {
  metadata: PostMetadata
  content: string
}

export type PostMetadata = {
  slug: string
  title?: string
  description?: string
  category?: string
  publishedAt?: string
  author?: {
    name: string
    picture: string
  }
  image?: string
  featured?: boolean
  readTime?: string
  keywords?: string[]
}

const CONTENT_DIR = join(process.cwd(), 'src/content/blog')

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'copyapes'
const GITHUB_REPO = process.env.GITHUB_REPO || 'copyapes_web'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'
const CONTENT_PATH = 'src/content/blog'

function sortPosts(posts: PostMetadata[]): PostMetadata[] {
  return posts.sort(
    (a, b) => new Date(b.publishedAt ?? '').getTime() - new Date(a.publishedAt ?? '').getTime()
  )
}

async function getLocalPosts(limit?: number): Promise<PostMetadata[]> {
  const files = await readdir(CONTENT_DIR)
  const mdxFiles = files.filter(file => file.endsWith('.mdx'))

  const posts = await Promise.all(
    mdxFiles.map(async file => {
      const slug = file.replace(/\.mdx$/, '')
      const fileContent = await readFile(join(CONTENT_DIR, file), 'utf8')
      const { data } = matter(fileContent)

      return { ...data, slug } as PostMetadata
    })
  )

  const sorted = sortPosts(posts)

  return limit ? sorted.slice(0, limit) : sorted
}

async function getLocalPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fileContent = await readFile(join(CONTENT_DIR, `${slug}.mdx`), 'utf8')
    const { data, content } = matter(fileContent)

    return { metadata: { ...data, slug }, content }
  } catch {
    return null
  }
}

async function getRemotePostBySlug(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/refs/heads/${GITHUB_BRANCH}/${CONTENT_PATH}/${slug}.mdx`,
      { next: { revalidate: 3600 } }
    )

    if (!res.ok) {
      return null
    }

    const fileContent = await res.text()
    const { data, content } = matter(fileContent)

    return { metadata: { ...data, slug }, content }
  } catch {
    return null
  }
}

async function getRemotePosts(limit?: number): Promise<PostMetadata[]> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${CONTENT_PATH}`,
    {
      headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : undefined,
      next: { revalidate: 3600 }
    }
  )

  if (!res.ok) {
    throw new Error('Failed to fetch directory')
  }

  const files = await res.json()
  const mdxFiles = files.filter((file: { name: string }) => file.name.endsWith('.mdx'))

  const posts = await Promise.all(
    mdxFiles.map(async (file: { name: string }) => {
      const slug = file.name.replace(/\.mdx$/, '')
      const post = await getRemotePostBySlug(slug)

      return post?.metadata ?? { slug }
    })
  )

  const sorted = sortPosts(posts)

  return limit ? sorted.slice(0, limit) : sorted
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const localPost = await getLocalPostBySlug(slug)

  if (localPost) {
    return localPost
  }

  return getRemotePostBySlug(slug)
}

export async function getPosts(limit?: number): Promise<PostMetadata[]> {
  try {
    const localPosts = await getLocalPosts(limit)

    if (localPosts.length > 0) {
      return localPosts
    }
  } catch (error) {
    console.warn('Failed to read local posts, falling back to GitHub:', error)
  }

  try {
    return await getRemotePosts(limit)
  } catch (error) {
    console.error('Error fetching posts:', error)

    return []
  }
}

export async function getPostMetadata(filepath: string): Promise<PostMetadata> {
  const slug = filepath.replace(/\.mdx$/, '')
  const post = await getPostBySlug(slug)

  return post?.metadata ?? { slug }
}
