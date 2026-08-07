import GithubSlugger from 'github-slugger'

export type DocsTocItem = {
  level: number
  text: string
  href: string
}

/** Extract h2-h4 TOC; slug algorithm matches rehype-slug (github-slugger). */
export function getDocsTableOfContents(content: string): DocsTocItem[] {
  const slugger = new GithubSlugger()
  const items: DocsTocItem[] = []
  const headingRegex = /^(#{2,4})\s+(.+)$/gm

  let match = headingRegex.exec(content)

  while (match !== null) {
    const level = match[1].length
    const text = match[2].replace(/\{#.*?\}/g, '').trim()

    items.push({
      level,
      text,
      href: `#${slugger.slug(text)}`
    })

    match = headingRegex.exec(content)
  }

  return items
}
