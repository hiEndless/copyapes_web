import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getTranslations } from 'next-intl/server'

import { DocsBreadcrumb } from '@/components/docs/article/breadcrumb'
import { DocsPagination } from '@/components/docs/article/pagination'
import DocsMDXContent from '@/components/docs/mdx-content'
import { DocsTableOfContents } from '@/components/docs/toc'
import { DocsTypography } from '@/components/docs/typography'
import { Separator } from '@/components/ui/separator'
import { localeToOgLocale } from '@/i18n/locales'
import { routing } from '@/i18n/routing'
import { getContentBySlug, listContent, listTutorialSlugs } from '@/lib/content'
import { flattenDocsRoutes, getDocsTableOfContents } from '@/lib/docs'
import { extractFaqsFromMarkdown } from '@/lib/extract-headings'
import {
  buildAlternates,
  buildTechArticleJsonLd,
  getCanonicalUrl,
  jsonLdScriptProps,
  resolveDocsMetaDescription,
  toSchemaDate
} from '@/lib/seo'

type DocsParams = { locale: string; slug: string[] }

export async function generateMetadata({
  params
}: {
  params: Promise<DocsParams>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const slugPath = slug.join('/')
  const doc = await getContentBySlug('tutorials', slugPath, locale)
  const siteT = await getTranslations({ locale, namespace: 'Metadata' })
  const tDocs = await getTranslations({ locale, namespace: 'Docs' })

  if (!doc) {
    return {}
  }

  const title = doc.metadata.title || slugPath
  const description = resolveDocsMetaDescription(title, doc.metadata.description, doc.content)
  const path = `/docs/${slugPath}`
  const publishedTime = toSchemaDate(doc.metadata.publishedAt)
  const modifiedTime = toSchemaDate(doc.metadata.updatedAt || doc.metadata.publishedAt)
  const keywords =
    doc.metadata.keywords?.length
      ? doc.metadata.keywords
      : doc.metadata.tags?.length
        ? doc.metadata.tags
        : undefined
  const cover = doc.metadata.coverImage

  return {
    title,
    description,
    keywords,
    alternates: buildAlternates(path, locale),
    openGraph: {
      type: 'article',
      title,
      description,
      url: getCanonicalUrl(path, locale),
      siteName: siteT('siteName'),
      locale: localeToOgLocale(locale),
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      section: tDocs('navDocs'),
      tags: keywords,
      images: cover
        ? [
            {
              url: cover,
              width: 1200,
              height: 630,
              alt: title
            }
          ]
        : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: cover ? [cover] : undefined
    }
  }
}

export const dynamicParams = true

export async function generateStaticParams() {
  const localeSlugs = await Promise.all(
    routing.locales.map(async locale => {
      const slugs = await listTutorialSlugs(locale)

      return slugs.map(slug => ({ slug: slug.split('/') }))
    })
  )

  const seen = new Set<string>()
  const params: Array<{ slug: string[] }> = []

  for (const entries of localeSlugs) {
    for (const entry of entries) {
      const key = entry.slug.join('/')

      if (seen.has(key)) continue

      seen.add(key)
      params.push(entry)
    }
  }

  return params
}

const DocsDetailPage = async ({ params }: { params: Promise<DocsParams> }) => {
  const { locale, slug } = await params
  const slugPath = slug.join('/')
  const doc = await getContentBySlug('tutorials', slugPath, locale)

  if (!doc) {
    notFound()
  }

  const siteT = await getTranslations({ locale, namespace: 'Metadata' })
  const tDocs = await getTranslations({ locale, namespace: 'Docs' })
  const tBlog = await getTranslations({ locale, namespace: 'BlogMetadata' })
  const tutorials = await listContent('tutorials', locale)
  const routes = flattenDocsRoutes(tutorials)
  const tocs = getDocsTableOfContents(doc.content)
  const faqs = extractFaqsFromMarkdown(doc.content)
  const title = doc.metadata.title || slugPath
  const description = resolveDocsMetaDescription(title, doc.metadata.description, doc.content)
  const keywords =
    doc.metadata.keywords?.length
      ? doc.metadata.keywords
      : doc.metadata.tags?.length
        ? doc.metadata.tags
        : undefined

  const jsonLd = buildTechArticleJsonLd({
    locale,
    siteName: siteT('siteName'),
    siteDescription: siteT('description'),
    homeLabel: tBlog('home'),
    docsLabel: tDocs('navDocs'),
    title,
    description,
    slug: slugPath,
    image: doc.metadata.coverImage,
    publishedAt: doc.metadata.publishedAt,
    updatedAt: doc.metadata.updatedAt,
    keywords,
    faqs
  })

  return (
    <>
      <article className='flex items-start gap-10'>
        <section className='min-w-0 flex-[3]'>
          <DocsBreadcrumb paths={slug} />
          <header className='space-y-4'>
            <h1 className='text-3xl font-semibold'>{doc.metadata.title}</h1>
            {doc.metadata.description?.trim() &&
            doc.metadata.description.trim() !== doc.metadata.title.trim() ? (
              <p className='text-muted-foreground text-sm'>{doc.metadata.description}</p>
            ) : null}
            <Separator />
          </header>

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
      </article>
      <script {...jsonLdScriptProps(jsonLd)} />
    </>
  )
}

export default DocsDetailPage
