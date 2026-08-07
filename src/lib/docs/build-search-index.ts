import 'server-only'

import { getContentBySlug, listContent } from '@/lib/content'
import type { DocsSearchDocument } from '@/lib/docs/search'

function cleanContentForSearch(content: string): string {
  let cleanedContent = content

  cleanedContent = cleanedContent.replace(/```[\s\S]*?```/g, ' ')
  cleanedContent = cleanedContent.replace(/`([^`]+)`/g, '$1')
  cleanedContent = cleanedContent.replace(/#{1,6}\s+(.+)/g, '$1')
  cleanedContent = cleanedContent.replace(/\*\*(.+?)\*\*/g, '$1').replace(/_(.+?)_/g, '$1')
  cleanedContent = cleanedContent.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  cleanedContent = cleanedContent.replace(/\|.*\|[\r\n]?/gm, match =>
    match
      .split('|')
      .filter(cell => cell.trim())
      .map(cell => cell.trim())
      .join(' ')
  )
  cleanedContent = cleanedContent.replace(
    /<(?:Note|Card|Step|FileTree|Folder|File|Mermaid)[^>]*>([\s\S]*?)<\/(?:Note|Card|Step|FileTree|Folder|File|Mermaid)>/g,
    '$1'
  )
  cleanedContent = cleanedContent
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*\[[x\s]\]\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
  cleanedContent = cleanedContent
    .replace(/[^\w\s\u4e00-\u9fff-:]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim()

  return cleanedContent
}

export async function buildDocsSearchIndex(locale: string): Promise<DocsSearchDocument[]> {
  const tutorials = await listContent('tutorials', locale)

  const docs = await Promise.all(
    tutorials.map(async item => {
      const doc = await getContentBySlug('tutorials', item.slug, locale)

      if (!doc) return null

      const content = doc.content
      const headings =
        content.match(/^##\s+(.+)$/gm)?.map(h => h.replace(/^##\s+/, '').trim()) || []
      const extractedKeywords = new Set([
        ...(doc.metadata.keywords || []),
        ...headings,
        ...(content.match(/\*\*([^*]+)\*\*/g) || []).map(m => m.replace(/\*\*/g, '').trim()),
        ...(content.match(/`([^`]+)`/g) || []).map(m => m.replace(/`/g, '').trim())
      ])

      return {
        slug: item.slug,
        title: doc.metadata.title,
        description: doc.metadata.description || '',
        content,
        _searchMeta: {
          cleanContent: cleanContentForSearch(content),
          headings,
          keywords: Array.from(extractedKeywords)
        }
      } satisfies DocsSearchDocument
    })
  )

  return docs.filter((item): item is DocsSearchDocument => item !== null)
}
