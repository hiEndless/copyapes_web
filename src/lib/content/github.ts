import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const GITHUB_USERNAME = process.env.CONTENT_GITHUB_USERNAME || process.env.GITHUB_USERNAME || 'hiEndless'
const GITHUB_REPO = process.env.CONTENT_GITHUB_REPO || process.env.GITHUB_REPO || 'copyapes_content'
const GITHUB_BRANCH = process.env.CONTENT_GITHUB_BRANCH || process.env.GITHUB_BRANCH || 'main'
const REVALIDATE_SECONDS = Number(process.env.CONTENT_REVALIDATE_SECONDS || 3600)

export function getContentRepoConfig() {
  return {
    username: GITHUB_USERNAME,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH
  }
}

export function getRawContentBaseUrl() {
  const { username, repo, branch } = getContentRepoConfig()

  return `https://raw.githubusercontent.com/${username}/${repo}/${branch}`
}

function getLocalContentRoot(): string | null {
  if (process.env.CONTENT_LOCAL_ROOT === '') {
    return null
  }

  if (process.env.CONTENT_LOCAL_ROOT) {
    return process.env.CONTENT_LOCAL_ROOT
  }

  // Monorepo sibling default for local/dev: copyapes/copyapes_content
  return join(process.cwd(), '..', 'copyapes_content')
}

async function readLocalText(path: string): Promise<string | null> {
  const root = getLocalContentRoot()

  if (!root) {
    return null
  }

  try {
    return await readFile(join(root, path), 'utf8')
  } catch {
    return null
  }
}

function authHeaders(): HeadersInit | undefined {
  const token = process.env.CONTENT_GITHUB_TOKEN || process.env.GITHUB_TOKEN

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

export async function fetchContentText(path: string): Promise<string | null> {
  const local = await readLocalText(path)

  if (local !== null) {
    return local
  }

  const url = `${getRawContentBaseUrl()}/${path}`

  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS }
    })

    if (!res.ok) {
      return null
    }

    return await res.text()
  } catch (error) {
    console.error('Failed to fetch content text:', path, error)

    return null
  }
}

export async function fetchContentJson<T>(path: string): Promise<T | null> {
  const text = await fetchContentText(path)

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as T
  } catch (error) {
    console.error('Failed to parse content json:', path, error)

    return null
  }
}
