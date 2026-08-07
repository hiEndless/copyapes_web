import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import { redirect } from '@/i18n/routing'
import { listContent } from '@/lib/content'
import { flattenDocsRoutes } from '@/lib/docs'
import { buildAlternates } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  return {
    title: 'Docs',
    description: 'CopyApes tutorials and product guides',
    alternates: buildAlternates('/docs', locale)
  }
}

const DocsIndexPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const tutorials = await listContent('tutorials', locale)
  const routes = flattenDocsRoutes(tutorials)

  if (routes[0]?.slug) {
    redirect({ href: `/docs/${routes[0].slug}`, locale })
  }

  const tFooter = await getTranslations({ locale, namespace: 'Footer' })

  return (
    <div className='space-y-8'>
      <div className='space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight'>{tFooter('tutorial')}</h1>
        <p className='text-muted-foreground leading-7'>CopyApes product tutorials and guides.</p>
      </div>

      <ul className='space-y-4'>
        <li className='text-muted-foreground text-sm'>暂无已发布文档。</li>
      </ul>
    </div>
  )
}

export default DocsIndexPage
