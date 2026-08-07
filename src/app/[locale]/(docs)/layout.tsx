import type { ReactNode } from 'react'

import { DocsFooter } from '@/components/docs/navigation/footer'
import { DocsNavbar } from '@/components/docs/navigation/navbar'
import { DocsShell } from '@/components/docs/shell'
import { listContent } from '@/lib/content'
import { buildDocsSearchIndex } from '@/lib/docs/build-search-index'
import { buildDocsNav } from '@/lib/docs'

const DocsGroupLayout = async ({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params
  const tutorials = await listContent('tutorials', locale)
  const navItems = buildDocsNav(tutorials, locale)
  const searchDocuments = await buildDocsSearchIndex(locale)

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      <DocsNavbar navItems={navItems} searchDocuments={searchDocuments} />
      <main className='h-auto flex-1 px-2 sm:px-5'>
        <DocsShell navItems={navItems}>{children}</DocsShell>
      </main>
      <DocsFooter />
    </div>
  )
}

export default DocsGroupLayout
