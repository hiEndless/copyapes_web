import { notFound } from 'next/navigation'

import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Link } from '@/i18n/routing'
import { localeToDateLocale, localeToOgLocale } from '@/i18n/locales'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import MDXContent from '@/components/mdx-content'
import TableOfContents from '@/components/blog/table-of-contents'

import { getPostBySlug, getPosts } from '@/lib/posts'
import { extractFaqsFromMarkdown, extractHeadings } from '@/lib/extract-headings'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

import RelatedBlogSection from '@/components/blog/related-blog-section/related-blog-section'
import SectionSeparator from '@/components/section-separator'
import { SecondaryFlowButton } from '@/components/ui/flow-button'
import { buildAlternates, buildBlogPostingJsonLd, getCanonicalUrl, jsonLdScriptProps, toSchemaDate } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'BlogMetadata' })
  const siteT = await getTranslations({ locale, namespace: 'Metadata' })
  const post = await getPostBySlug(slug, locale)

  if (!post) {
    return {}
  }

  const { metadata } = post
  const path = `/blog/${metadata.slug}`
  const publishedTime = toSchemaDate(metadata.publishedAt)
  const modifiedTime = toSchemaDate(metadata.updatedAt || metadata.publishedAt)
  const cover = metadata.coverImage ?? metadata.image

  return {
    title: t('postTitle', { title: metadata.title ?? slug }),
    description: metadata.description ?? t('description'),
    keywords: metadata.keywords,
    alternates: buildAlternates(path, locale),
    openGraph: {
      type: 'article',
      title: metadata.title ?? slug,
      description: metadata.description ?? t('description'),
      url: getCanonicalUrl(path, locale),
      siteName: siteT('siteName'),
      locale: localeToOgLocale(locale),
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      authors: metadata.author?.name ? [metadata.author.name] : undefined,
      images: cover
        ? [
            {
              url: cover,
              width: 1200,
              height: 630,
              alt: metadata.title ?? slug
            }
          ]
        : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title ?? slug,
      description: metadata.description ?? t('description'),
      images: cover ? [cover] : undefined
    }
  }
}

export const dynamicParams = true

export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map(post => ({ slug: post.slug }))
}

const BlogDetailsPage = async ({ params }: { params: Promise<{ locale: string; slug: string }> }) => {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'BlogMetadata' })
  const siteT = await getTranslations({ locale, namespace: 'Metadata' })
  const posts = await getPosts(undefined, locale)

  const post = await getPostBySlug(slug, locale)

  if (!post) {
    notFound()
  }

  const { metadata, content } = post

  // Sort posts by published date
  const allPosts = posts.sort(
    (a, b) => new Date(a.publishedAt ?? '').getTime() - new Date(b.publishedAt ?? '').getTime()
  )

  // Find the current post index
  const currentPostIndex = allPosts.findIndex(p => p.slug === slug)
  const previousPost = currentPostIndex > 0 ? allPosts[currentPostIndex - 1] : null
  const nextPost = currentPostIndex < allPosts.length - 1 ? allPosts[currentPostIndex + 1] : null

  const sameCategoryPosts = allPosts.filter(p => p.category === metadata.category && p.slug !== slug)
  const otherCategoryPosts = allPosts.filter(p => p.category !== metadata.category && p.slug !== slug)
  const relatedPosts = [...sameCategoryPosts, ...otherCategoryPosts].slice(0, 3)

  // Extract headings for TOC
  const headings = extractHeadings(content)
  const faqs = extractFaqsFromMarkdown(content)

  const publishedLabel = metadata.publishedAt
    ? new Date(metadata.publishedAt).toLocaleDateString(localeToDateLocale(locale), {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
      })
    : ''

  const jsonLd = buildBlogPostingJsonLd({
    locale,
    siteName: siteT('siteName'),
    siteDescription: siteT('description'),
    homeLabel: t('home'),
    blogLabel: t('title'),
    title: metadata.title ?? slug,
    description: metadata.description ?? siteT('description'),
    slug: metadata.slug,
    image: metadata.coverImage ?? metadata.image,
    publishedAt: metadata.publishedAt,
    updatedAt: metadata.updatedAt,
    authorName: metadata.author?.name,
    faqs
  })

  return (
    <>
      <section className='py-8 sm:py-16'>
        <div className='mx-auto grid w-full max-w-7xl grid-cols-1 px-4 sm:px-6 lg:grid-cols-[250px_1fr] lg:gap-12 lg:px-8 xl:gap-16'>
          <aside className='hidden lg:block'>
            <TableOfContents headings={headings} />
          </aside>

          <div>
            <Breadcrumb className='mb-6'>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href='/'>{t('home')}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href='/blog'>{t('title')}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{metadata.category}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className='mb-6 text-2xl font-semibold md:text-3xl lg:text-4xl'>{metadata.title}</h1>

            <p className='text-muted-foreground'>{metadata.description}</p>

            <Separator className='my-6' />

            <div className='mb-16 flex flex-wrap items-center justify-between gap-6'>
              <div className='flex items-center gap-2'>
                <Avatar className='size-11.5'>
                  <AvatarImage src={metadata.author?.picture} alt={metadata.author?.name} />
                  <AvatarFallback>{metadata.author?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col text-sm'>
                  <span className='text-muted-foreground mb-1'>{t('writtenBy')}</span>
                  <span className='font-medium'>{metadata.author?.name}</span>
                </div>
              </div>

              <div className='flex flex-col text-sm'>
                <span className='text-muted-foreground mb-1.5'>{t('readTime')}</span>
                <span className='font-medium'>{metadata.readTime}</span>
              </div>

              <div className='flex flex-col text-sm'>
                <span className='text-muted-foreground mb-1.5'>{t('postedOn')}</span>
                <span className='font-medium'>{publishedLabel}</span>
              </div>
            </div>

            {(metadata.coverImage ?? metadata.image) ? (
              <img
                src={metadata.coverImage ?? metadata.image}
                alt={metadata.title}
                className='mb-16 max-h-110 w-full rounded-xl object-cover'
              />
            ) : null}

            <MDXContent source={content} />

            <div className='flex items-center justify-between gap-4 pt-8 sm:pt-16'>
              {previousPost ? (
                <SecondaryFlowButton asChild size='lg'>
                  <Link href={`/blog/${previousPost.slug}`}>
                    <ChevronLeftIcon className='max-sm:hidden' />
                    {t('previousPost')}
                  </Link>
                </SecondaryFlowButton>
              ) : (
                <SecondaryFlowButton size='lg' className='pointer-events-none opacity-50'>
                  <ChevronLeftIcon className='max-sm:hidden' />
                  {t('previousPost')}
                </SecondaryFlowButton>
              )}
              {nextPost ? (
                <SecondaryFlowButton asChild size='lg'>
                  <Link href={`/blog/${nextPost.slug}`}>
                    {t('nextPost')}
                    <ChevronRightIcon className='max-sm:hidden' />
                  </Link>
                </SecondaryFlowButton>
              ) : (
                <SecondaryFlowButton size='lg' className='pointer-events-none opacity-50'>
                  {t('nextPost')}
                  <ChevronRightIcon className='max-sm:hidden' />
                </SecondaryFlowButton>
              )}
            </div>
          </div>
        </div>
      </section>

      <SectionSeparator />

      <div className="mb-16">
        <RelatedBlogSection posts={relatedPosts} />
      </div>

      <script {...jsonLdScriptProps(jsonLd)} />
    </>
  )
}

export default BlogDetailsPage
