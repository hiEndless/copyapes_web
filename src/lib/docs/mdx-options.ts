import type { Element, Text } from 'hast'
import 'server-only'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeCodeTitles from 'rehype-code-titles'
import rehypeKatex from 'rehype-katex'
import rehypePrism from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import type { Node } from 'unist'
import { visit } from 'unist-util-visit'

declare module 'hast' {
  interface Element {
    raw?: string
  }
}

const preCopy = () => (tree: Node) => {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'pre') {
      const [codeEl] = node.children as Element[]

      if (codeEl?.tagName === 'code') {
        const textNode = codeEl.children?.[0] as Text
        node.raw = textNode?.value || ''
      }
    }
  })
}

const postCopy = () => (tree: Node) => {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'pre' && node.raw) {
      node.properties = node.properties || {}
      node.properties.raw = node.raw
    }
  })
}

export const docsMdxOptions = {
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [
    preCopy,
    rehypeCodeTitles,
    rehypeKatex,
    rehypePrism,
    rehypeSlug,
    rehypeAutolinkHeadings,
    postCopy
  ]
}
