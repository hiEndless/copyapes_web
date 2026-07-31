import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getTranslations } from 'next-intl/server'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import MDXContent from '@/components/mdx-content'
import { Link } from '@/i18n/routing'
import { getContentBySlug, listTutorialSlugs } from '@/lib/content'
import { buildAlternates } from '@/lib/seo'

type DocsParams = { locale: string; slug: string[] }

export async function generateMetadata({
  params
}: {
  params: Promise<DocsParams>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const slugPath = slug.join('/')
  const doc = await getContentBySlug('tutorials', slugPath, locale)

  if (!doc) {
    return {}
  }

  return {
    title: doc.metadata.title,
    description: doc.metadata.description,
    keywords: doc.metadata.keywords,
    alternates: buildAlternates(`/docs/${slugPath}`, locale)
  }
}

export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await listTutorialSlugs('zh')

  return slugs.map(slug => ({ slug: slug.split('/') }))
}

const DocsDetailPage = async ({ params }: { params: Promise<DocsParams> }) => {
  const { locale, slug } = await params
  const slugPath = slug.join('/')
  const tFooter = await getTranslations({ locale, namespace: 'Footer' })
  const doc = await getContentBySlug('tutorials', slugPath, locale)

  if (!doc) {
    notFound()
  }

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8'>
      <Breadcrumb className='mb-6'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/'>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/docs'>{tFooter('tutorial')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{doc.metadata.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight'>{doc.metadata.title}</h1>
        {doc.metadata.description ? (
          <p className='text-muted-foreground leading-7'>{doc.metadata.description}</p>
        ) : null}
      </div>

      {doc.metadata.coverImage ? (
        <img
          src={doc.metadata.coverImage}
          alt={doc.metadata.title}
          className='mt-8 max-h-96 w-full rounded-xl object-cover'
        />
      ) : null}

      <div className='prose-content mt-10'>
        <MDXContent source={doc.content} />
      </div>
    </div>
  )
}

export default DocsDetailPage
