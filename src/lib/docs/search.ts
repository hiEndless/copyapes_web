export type DocsSearchMeta = {
  cleanContent: string
  headings: string[]
  keywords: string[]
}

export type DocsSearchDocument = {
  _searchMeta: DocsSearchMeta
  content: string
  description: string
  slug: string
  title: string
}

export type DocsSearchResult = {
  description?: string
  href: string
  relevance?: number
  snippet?: string
  title: string
}

function memoize<T extends (...args: never[]) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>
    }

    const result = fn(...args) as ReturnType<T>

    if (result !== '' && result != null) {
      cache.set(key, result)
    }

    return result
  }) as T
}

function searchMatch(a: string, b: string): number {
  if (typeof a !== 'string' || typeof b !== 'string') return 0

  let left = a
  let right = b
  const aLen = left.length
  const bLen = right.length

  if (aLen === 0) return bLen
  if (bLen === 0) return aLen

  if (aLen > bLen) {
    ;[left, right] = [right, left]
  }

  const maxDistance = Math.min(Math.max(Math.floor(left.length / 2), 2), 5)
  let prevRow = Array(left.length + 1).fill(0)
  let currRow = Array(left.length + 1).fill(0)

  for (let i = 0; i <= left.length; i++) prevRow[i] = i

  for (let j = 1; j <= right.length; j++) {
    currRow[0] = j

    for (let i = 1; i <= left.length; i++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      currRow[i] = Math.min(prevRow[i] + 1, currRow[i - 1] + 1, prevRow[i - 1] + cost)

      if (currRow[i] > maxDistance) {
        return maxDistance
      }
    }

    ;[prevRow, currRow] = [currRow, prevRow]
  }

  return Math.min(prevRow[left.length], maxDistance)
}

const memoizedSearchMatch = memoize(searchMatch)

function calculateProximityScore(query: string, content: string): number {
  if (typeof query !== 'string' || typeof content !== 'string') return 0

  const words = content.split(/\s+/)
  const queryWords = query.split(/\s+/)
  let proximityScore = 0
  let firstIndex = -1

  queryWords.forEach((queryWord, queryIndex) => {
    const wordIndex = words.indexOf(queryWord, firstIndex + 1)

    if (wordIndex !== -1) {
      if (queryIndex === 0) {
        proximityScore += 30
      } else if (wordIndex - firstIndex <= 3) {
        proximityScore += 20 - (wordIndex - firstIndex)
      }

      firstIndex = wordIndex
    } else {
      firstIndex = -1
    }
  })

  return proximityScore
}

function calculateRelevance(
  query: string,
  title: string,
  content: string,
  headings: string[],
  keywords: string[]
): number {
  const lowerQuery = query.toLowerCase().trim()
  const lowerTitle = title.toLowerCase()
  const queryWords = lowerQuery.split(/\s+/)
  let score = 0

  if (lowerTitle === lowerQuery) {
    score += 50
  } else if (lowerTitle.includes(lowerQuery)) {
    score += 30
  }

  queryWords.forEach(word => {
    if (lowerTitle.includes(word)) {
      score += 15
    }
  })

  const lowerHeadings = headings.map(h => h.toLowerCase())

  if (lowerHeadings.some(h => h === lowerQuery)) {
    score += 40
  }

  lowerHeadings.forEach(heading => {
    if (heading.includes(lowerQuery)) {
      score += 25
    }
  })

  const lowerKeywords = keywords.map(k => k.toLowerCase())

  if (lowerKeywords.some(k => k === lowerQuery)) {
    score += 35
  }

  lowerKeywords.forEach(keyword => {
    if (keyword.includes(lowerQuery)) {
      score += 20
    }
  })

  const exactMatches = content.toLowerCase().match(new RegExp(`\\b${lowerQuery}\\b`, 'gi'))

  if (exactMatches) {
    score += exactMatches.length * 10
  }

  queryWords.forEach(word => {
    if (content.toLowerCase().includes(word)) {
      score += 5
    }
  })

  score += calculateProximityScore(lowerQuery, content.toLowerCase()) * 2

  return score / Math.log(content.length + 1)
}

function extractSnippet(content: string, query: string): string {
  const indices: number[] = []
  const words = query.split(/\s+/)

  words.forEach(word => {
    const index = content.indexOf(word)

    if (index !== -1) {
      indices.push(index)
    }
  })

  if (indices.length === 0) {
    return content.slice(0, 100)
  }

  const avgIndex = Math.floor(indices.reduce((a, b) => a + b) / indices.length)
  const snippetLength = 160
  const contextLength = Math.floor(snippetLength / 2)
  const start = Math.max(0, avgIndex - contextLength)
  const end = Math.min(avgIndex + contextLength, content.length)

  let snippet = content.slice(start, end)

  if (start > 0) snippet = `...${snippet}`
  if (end < content.length) snippet += '...'

  return snippet
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }

  return chunks
}

export function highlight(snippet: string, searchTerms: string): string {
  if (!snippet || !searchTerms) return snippet

  const terms = searchTerms
    .split(/\s+/)
    .filter(term => term.trim().length > 0)
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  if (terms.length === 0) return snippet

  const regex = new RegExp(`(${terms.join('|')})`, 'gi')

  return snippet.replace(regex, "<span class='highlight'>$1</span>")
}

export function advanceSearch(
  query: string,
  searchData: DocsSearchDocument[]
): DocsSearchResult[] {
  const lowerQuery = query.toLowerCase().trim()
  const queryWords = lowerQuery.split(/\s+/).filter(word => word.length >= 3)

  if (queryWords.length === 0) return []

  const results = chunkArray(searchData, 100).flatMap(chunk =>
    chunk
      .map(doc => {
        const relevanceScore = calculateRelevance(
          queryWords.join(' '),
          doc.title,
          doc._searchMeta.cleanContent,
          doc._searchMeta.headings,
          doc._searchMeta.keywords
        )
        const snippet = extractSnippet(doc._searchMeta.cleanContent, lowerQuery)

        return {
          title: doc.title,
          href: doc.slug.startsWith('/') ? doc.slug : `/${doc.slug}`,
          snippet: highlight(snippet, queryWords.join(' ')),
          description: doc.description || '',
          relevance: relevanceScore
        }
      })
      .filter(doc => doc.relevance > 0)
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
  )

  return results.slice(0, 10)
}

export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export { memoizedSearchMatch }
