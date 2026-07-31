import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getTranslations } from 'next-intl/server'

import MDXContent from '@/components/mdx-content'
import { getContentBySlug } from '@/lib/content'
import { buildAlternates } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const doc = await getContentBySlug('legal', 'privacy', locale)

  if (doc) {
    return {
      title: doc.metadata.title,
      description: doc.metadata.description,
      alternates: buildAlternates('/privacy', locale)
    }
  }

  const t = await getTranslations({ locale, namespace: 'PrivacyPolicy' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    alternates: buildAlternates('/privacy', locale)
  }
}

const PrivacyPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const doc = await getContentBySlug('legal', 'privacy', locale)

  if (!doc) {
    notFound()
  }

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8'>
      <div className='space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight'>{doc.metadata.title}</h1>
        <p className='text-muted-foreground text-sm'>
          {doc.metadata.updatedAt ? `Updated ${doc.metadata.updatedAt}` : null}
          {doc.metadata.version ? ` · v${doc.metadata.version}` : null}
        </p>
        {doc.metadata.description ? (
          <p className='text-muted-foreground leading-7'>{doc.metadata.description}</p>
        ) : null}
      </div>

      <div className='prose-content mt-10'>
        <MDXContent source={doc.content} />
      </div>
    </div>
  )
}

export default PrivacyPage
