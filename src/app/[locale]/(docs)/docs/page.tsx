import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import { redirect } from '@/i18n/routing'
import { listContent } from '@/lib/content'
import { flattenDocsRoutes } from '@/lib/docs'
import {
  buildAlternates,
  buildDocsPageJsonLd,
  buildSocialMetadata,
  jsonLdScriptProps
} from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const siteT = await getTranslations({ locale, namespace: 'Metadata' })
  const tFooter = await getTranslations({ locale, namespace: 'Footer' })
  const title = tFooter('tutorial')
  const description = siteT('description')

  return {
    title,
    description,
    keywords: siteT.raw('keywords') as string[],
    ...buildSocialMetadata({
      locale,
      path: '/docs',
      title,
      description,
      siteName: siteT('siteName')
    }),
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

  const siteT = await getTranslations({ locale, namespace: 'Metadata' })
  const tFooter = await getTranslations({ locale, namespace: 'Footer' })
  const pageTitle = tFooter('tutorial')
  const pageDescription = siteT('description')

  const jsonLd = buildDocsPageJsonLd({
    locale,
    siteName: siteT('siteName'),
    siteDescription: siteT('description'),
    pageTitle,
    pageDescription,
    docs: tutorials.map(item => ({
      title: item.title,
      description: item.description,
      slug: item.slug,
      publishedAt: item.publishedAt,
      updatedAt: item.updatedAt
    }))
  })

  return (
    <>
      <div className='space-y-8'>
        <div className='space-y-3'>
          <h1 className='text-3xl font-semibold tracking-tight'>{pageTitle}</h1>
          <p className='text-muted-foreground leading-7'>{pageDescription}</p>
        </div>

        <ul className='space-y-4'>
          <li className='text-muted-foreground text-sm'>暂无已发布文档。</li>
        </ul>
      </div>
      <script {...jsonLdScriptProps(jsonLd)} />
    </>
  )
}

export default DocsIndexPage
