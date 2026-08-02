/**
 * Extracts headings from MDX content string
 * @param content - The MDX content string
 * @returns Array of heading objects with slug, text, and depth
 */
export function extractHeadings(content: string): { slug: string; text: string; depth: number }[] {
  const headings: { slug: string; text: string; depth: number }[] = []
  const seen = new Map<string, number>()

  // Regex to match markdown headings (## Heading, ### Heading, etc.)
  const headingRegex = /^(#{2,6})\s+(.+)$/gm

  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length - 2 // Convert to 0-based depth (h2 = 0, h3 = 1, etc.)
    const text = match[2].trim()
    const slug = uniqueSlug(generateSlug(text), seen)

    headings.push({ slug, text, depth })
  }

  return headings
}

/**
 * Generates a URL-friendly slug from text.
 * Keeps Unicode letters/numbers so CJK headings are not stripped to empty.
 */
export function generateSlug(text: string): string {
  const slug = text
    .toString()
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'section'
}

function uniqueSlug(base: string, seen: Map<string, number>): string {
  const count = seen.get(base) ?? 0
  seen.set(base, count + 1)

  return count === 0 ? base : `${base}-${count}`
}

/**
 * Extract FAQ pairs from markdown sections titled FAQ / 常见问题 / よくある質問 / 자주 묻는 질문.
 * Expects ### Question headings followed by answer paragraphs until the next heading.
 */
export function extractFaqsFromMarkdown(content: string): Array<{ question: string; answer: string }> {
  const headingRegex = /^##\s+(?:FAQ|常见问题|常見問題|よくある質問|자주 묻는 질문)\s*$/gim
  const headingMatch = headingRegex.exec(content)

  if (!headingMatch) {
    return []
  }

  const sectionStart = headingMatch.index + headingMatch[0].length
  const rest = content.slice(sectionStart)
  const nextHeading = rest.search(/^##\s+/m)
  const section = (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim()
  const faqs: Array<{ question: string; answer: string }> = []
  const parts = section.split(/^###\s+/m).slice(1)

  for (const part of parts) {
    const newline = part.indexOf('\n')
    const question = (newline === -1 ? part : part.slice(0, newline)).trim()
    const answer = (newline === -1 ? '' : part.slice(newline + 1))
      .replace(/^\s*>\s?/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\n+/g, ' ')
      .trim()

    if (question && answer) {
      faqs.push({ question, answer })
    }
  }

  return faqs
}

/** Flatten MDX/React heading children into plain text for slug generation. */
export function headingTextFromChildren(children: unknown): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(headingTextFromChildren).join('')
  }

  if (children && typeof children === 'object' && 'props' in children) {
    return headingTextFromChildren((children as { props?: { children?: unknown } }).props?.children)
  }

  return ''
}
