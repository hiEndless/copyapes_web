import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DocsBreadcrumb } from '@/components/docs/article/breadcrumb'
import { DocsPagination } from '@/components/docs/article/pagination'
import DocsMDXContent from '@/components/docs/mdx-content'
import { DocsTableOfContents } from '@/components/docs/toc'
import { DocsTypography } from '@/components/docs/typography'
import { Separator } from '@/components/ui/separator'
import { getContentBySlug, listContent, listTutorialSlugs } from '@/lib/content'
import { flattenDocsRoutes, getDocsTableOfContents } from '@/lib/docs'
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
  const doc = await getContentBySlug('tutorials', slugPath, locale)

  if (!doc) {
    notFound()
  }

  const tutorials = await listContent('tutorials', locale)
  const routes = flattenDocsRoutes(tutorials)
  const tocs = getDocsTableOfContents(doc.content)

  return (
    <div className='flex items-start gap-10'>
      <section className='min-w-0 flex-[3]'>
        <DocsBreadcrumb paths={slug} />
        <div className='space-y-4'>
          <h1 className='text-3xl font-semibold'>{doc.metadata.title}</h1>
          {doc.metadata.description?.trim() &&
          doc.metadata.description.trim() !== doc.metadata.title.trim() ? (
            <p className='text-muted-foreground text-sm'>{doc.metadata.description}</p>
          ) : null}
          <Separator />
        </div>

        {doc.metadata.coverImage ? (
          <img
            src={doc.metadata.coverImage}
            alt={doc.metadata.title}
            className='mt-6 max-h-96 w-full rounded-xl object-cover'
          />
        ) : null}

        <DocsTypography>
          <section>
            <DocsMDXContent source={doc.content} />
          </section>
          <DocsPagination slug={slugPath} routes={routes} />
        </DocsTypography>
      </section>

      <DocsTableOfContents
        contentPath={doc.path}
        title={doc.metadata.title}
        tocs={tocs}
      />
    </div>
  )
}

export default DocsDetailPage
