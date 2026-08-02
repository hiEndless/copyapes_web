import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getTranslations } from 'next-intl/server'

import MDXContent from '@/components/mdx-content'
import { getContentBySlug } from '@/lib/content'
import { extractFaqsFromMarkdown } from '@/lib/extract-headings'
import {
  buildAlternates,
  buildLegalPageJsonLd,
  buildSocialMetadata,
  getCanonicalUrl,
  jsonLdScriptProps,
  toSchemaDate
} from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const doc = await getContentBySlug('legal', 'terms', locale)
  const tm = await getTranslations({ locale, namespace: 'Metadata' })
  const t = await getTranslations({ locale, namespace: 'TermsOfService' })

  const title = doc?.metadata.title ?? t('metadata.title')
  const description = doc?.metadata.description ?? t('metadata.description')
  const publishedTime = toSchemaDate(doc?.metadata.publishedAt)
  const modifiedTime = toSchemaDate(doc?.metadata.updatedAt || doc?.metadata.publishedAt)

  const social = buildSocialMetadata({
    locale,
    path: '/terms',
    title,
    description,
    siteName: tm('siteName')
  })

  return {
    title,
    description,
    ...social,
    alternates: buildAlternates('/terms', locale),
    openGraph: {
      ...social.openGraph,
      type: 'article',
      url: getCanonicalUrl('/terms', locale),
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      authors: [tm('siteName')]
    }
  }
}

const TermsPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const doc = await getContentBySlug('legal', 'terms', locale)
  const t = await getTranslations({ locale, namespace: 'TermsOfService' })
  const tm = await getTranslations({ locale, namespace: 'Metadata' })
  const blogT = await getTranslations({ locale, namespace: 'BlogMetadata' })

  if (!doc) {
    notFound()
  }

  const faqs = extractFaqsFromMarkdown(doc.content)
  const jsonLd = buildLegalPageJsonLd({
    locale,
    siteName: tm('siteName'),
    siteDescription: tm('description'),
    homeLabel: blogT('home'),
    pageTitle: doc.metadata.title,
    pageDescription: doc.metadata.description,
    path: '/terms',
    publishedAt: doc.metadata.publishedAt,
    updatedAt: doc.metadata.updatedAt,
    version: doc.metadata.version,
    faqs
  })

  const metaBits = [
    doc.metadata.updatedAt ? t('updatedLabel', { date: doc.metadata.updatedAt }) : null,
    doc.metadata.version ? t('versionLabel', { version: String(doc.metadata.version) }) : null
  ].filter(Boolean)

  return (
    <>
      <div className='mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8'>
        <div className='space-y-3'>
          <h1 className='text-3xl font-semibold tracking-tight'>{doc.metadata.title}</h1>
          {metaBits.length > 0 ? <p className='text-muted-foreground text-sm'>{metaBits.join(' · ')}</p> : null}
          {doc.metadata.description ? (
            <p className='text-muted-foreground leading-7'>{doc.metadata.description}</p>
          ) : null}
        </div>

        <div className='prose-content mt-10'>
          <MDXContent source={doc.content} />
        </div>
      </div>

      <script {...jsonLdScriptProps(jsonLd)} />
    </>
  )
}

export default TermsPage
