import { DocsTableAnchor } from '@/components/docs/toc/anchor'
import { DocsBackToTop } from '@/components/docs/toc/backtotop'
import { DocsFeedback } from '@/components/docs/toc/feedback'
import { docsSettings } from '@/lib/docs/navigation'
import type { DocsTocItem } from '@/lib/docs/toc'

interface TableProps {
  contentPath: string
  title: string
  tocs: DocsTocItem[]
}

export function DocsTableOfContents({ tocs, contentPath, title }: TableProps) {
  if (!docsSettings.rightbar) return null

  return (
    <aside
      aria-label='Table of contents'
      className='toc sticky top-26 hidden h-[calc(100vh-8rem)] min-w-57.5 gap-3 xl:flex xl:flex-col'
    >
      {docsSettings.toc ? <DocsTableAnchor tocs={tocs} /> : null}
      {docsSettings.feedback ? <DocsFeedback contentPath={contentPath} title={title} /> : null}
      {docsSettings.totop ? <DocsBackToTop /> : null}
    </aside>
  )
}
