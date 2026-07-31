import { readFile } from 'node:fs/promises'
import { join, normalize } from 'node:path'

import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

function getLocalContentRoot(): string | null {
  if (process.env.CONTENT_LOCAL_ROOT === '') {
    return null
  }

  if (process.env.CONTENT_LOCAL_ROOT) {
    return process.env.CONTENT_LOCAL_ROOT
  }

  return join(process.cwd(), '..', 'copyapes_content')
}

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif'
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const root = getLocalContentRoot()

  if (!root) {
    return new Response('Local content root disabled', { status: 404 })
  }

  const { path: parts } = await context.params
  const relative = parts.join('/')

  if (!relative.startsWith('assets/images/') || relative.includes('..')) {
    return new Response('Invalid asset path', { status: 400 })
  }

  const absolute = normalize(join(root, relative))

  if (!absolute.startsWith(normalize(root))) {
    return new Response('Invalid asset path', { status: 400 })
  }

  try {
    const data = await readFile(absolute)
    const ext = absolute.slice(absolute.lastIndexOf('.')).toLowerCase()
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'

    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
