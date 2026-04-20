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

// Remote repository details
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'copyapes'
const GITHUB_REPO = process.env.GITHUB_REPO || 'copyapes_web'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'
const CONTENT_PATH = 'src/content/blog'

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!process.env.GITHUB_TOKEN && process.env.NODE_ENV === 'production') {
    return null
  }

  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/refs/heads/${GITHUB_BRANCH}/${CONTENT_PATH}/${slug}.mdx`
    )

    if (!res.ok) throw new Error('Failed to fetch')

    const fileContent = await res.text()

    const { data, content } = matter(fileContent)

    return { metadata: { ...data, slug }, content }
  } catch {
    return null
  }
}

export async function getPosts(limit?: number): Promise<PostMetadata[]> {
  if (!process.env.GITHUB_TOKEN && process.env.NODE_ENV === 'production') {
    return []
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${CONTENT_PATH}`, {
      headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : undefined
    })

    if (!res.ok) throw new Error('Failed to fetch directory')

    const files = await res.json()

    // Filter only .mdx files
    const mdxFiles = files.filter((file: any) => file.name.endsWith('.mdx'))

    // Fetch metadata for each file
    const posts = await Promise.all(mdxFiles.map(async (file: any) => await getPostMetadata(file.name)))

    // Sort posts by published date
    const sortedPosts = posts.sort((a, b) => {
      if (new Date(a.publishedAt ?? '') < new Date(b.publishedAt ?? '')) {
        return 1
      } else {
        return -1
      }
    })

    if (limit) {
      return sortedPosts.slice(0, limit)
    }

    return sortedPosts
  } catch (error) {
    console.error('Error fetching posts:', error)

    return []
  }
}

export async function getPostMetadata(filepath: string): Promise<PostMetadata> {
  if (!process.env.GITHUB_TOKEN && process.env.NODE_ENV === 'production') {
    return { slug: filepath.replace(/\.mdx$/, '') }
  }

  try {
    const slug = filepath.replace(/\.mdx$/, '')

    const res = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/refs/heads/${GITHUB_BRANCH}/${CONTENT_PATH}/${filepath}`
    )

    if (!res.ok) throw new Error('Failed to fetch metadata')

    const fileContent = await res.text()

    const { data } = matter(fileContent)

    return { ...data, slug }
  } catch (error) {
    console.error(`Error fetching metadata for ${filepath}:`, error)

    return { slug: filepath.replace(/\.mdx$/, '') }
  }
}
