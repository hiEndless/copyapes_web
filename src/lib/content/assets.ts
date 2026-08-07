import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { fetchContentJson, getRawContentBaseUrl } from './github'
import type { AssetManifest } from './types'
import { DEFAULT_CONTENT_LOCALE, type ContentLocale } from './locales'

const ASSET_PREFIX = '@asset:'
let manifestPromise: Promise<AssetManifest> | null = null

function getLocalContentRoot(): string | null {
  if (process.env.CONTENT_LOCAL_ROOT === '') {
    return null
  }

  if (process.env.CONTENT_LOCAL_ROOT) {
    return process.env.CONTENT_LOCAL_ROOT
  }

  return join(process.cwd(), '..', 'copyapes_content')
}

async function getAssetManifest(): Promise<AssetManifest> {
  if (!manifestPromise) {
    manifestPromise = fetchContentJson<AssetManifest>('assets/manifests/images.json').then(
      data => data ?? {}
    )
  }

  return manifestPromise
}

function candidateManifestKeys(assetKey: string, locale: ContentLocale): string[] {
  const normalized = assetKey.replace(/^\/+/, '')
  const keys = [`${locale}/${normalized}`, `shared/${normalized}`, `${DEFAULT_CONTENT_LOCALE}/${normalized}`]

  return [...new Set(keys)]
}

function candidateLocalPaths(assetKey: string, locale: ContentLocale): string[] {
  const normalized = assetKey.replace(/^\/+/, '')

  return [
    `assets/images/${locale}/${normalized}`,
    `assets/images/shared/${normalized}`,
    `assets/images/${DEFAULT_CONTENT_LOCALE}/${normalized}`
  ]
}

function withVersionQuery(url: string, version: string): string {
  if (!version) return url

  const separator = url.includes('?') ? '&' : '?'

  return `${url}${separator}v=${version}`
}

/** Bust browser cache after same-path replacements; uses file mtime+size (no sync needed). */
function localAssetVersion(absolutePath: string): string {
  try {
    const st = statSync(absolutePath)

    return `${Math.trunc(st.mtimeMs)}-${st.size}`
  } catch {
    return ''
  }
}

function toServableUrl(localPath: string): string {
  const root = getLocalContentRoot()

  if (root && existsSync(join(root, localPath))) {
    const absolute = join(root, localPath)

    return withVersionQuery(`/api/content-assets/${localPath}`, localAssetVersion(absolute))
  }

  return `${getRawContentBaseUrl()}/${localPath}`
}

export async function resolveAssetRef(ref: string | undefined, locale: ContentLocale): Promise<string | undefined> {
  if (!ref) {
    return undefined
  }

  if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('/')) {
    return ref
  }

  if (!ref.startsWith(ASSET_PREFIX)) {
    return ref
  }

  const assetKey = ref.slice(ASSET_PREFIX.length)
  const manifest = await getAssetManifest()

  for (const key of candidateManifestKeys(assetKey, locale)) {
    const entry = manifest[key]

    // Local/dev: prefer sibling content files so empty/broken CDN does not break preview.
    if (entry?.local_path) {
      const root = getLocalContentRoot()

      if (root && existsSync(join(root, entry.local_path))) {
        return toServableUrl(entry.local_path)
      }
    }

    if (entry?.url) {
      // Same R2 key is overwritten on republish; bust CDN/browser cache with content hash.
      const version = typeof entry.sha256 === 'string' ? entry.sha256.slice(0, 12) : ''
      if (!version) {
        return entry.url
      }

      return withVersionQuery(entry.url, version)
    }

    if (entry?.local_path) {
      return toServableUrl(entry.local_path)
    }
  }

  for (const localPath of candidateLocalPaths(assetKey, locale)) {
    const root = getLocalContentRoot()

    if (root && existsSync(join(root, localPath))) {
      return toServableUrl(localPath)
    }
  }

  const [firstLocalPath] = candidateLocalPaths(assetKey, locale)

  return firstLocalPath ? toServableUrl(firstLocalPath) : undefined
}

export async function resolveAssetRefsInMarkdown(content: string, locale: ContentLocale): Promise<string> {
  const matches = [...content.matchAll(/@asset:[^\s)"'\]]+/g)]

  if (matches.length === 0) {
    return content
  }

  let resolved = content

  for (const match of matches) {
    const ref = match[0]
    const url = await resolveAssetRef(ref, locale)

    if (url) {
      resolved = resolved.replaceAll(ref, url)
    }
  }

  return resolved
}
