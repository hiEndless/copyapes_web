import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import BlogSection from '@/components/blog/blog-section/blog-section'
import { getPosts } from '@/lib/posts'
import { buildAlternates, buildBlogPageJsonLd, buildSocialMetadata, jsonLdScriptProps } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'BlogMetadata' })
  const siteT = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('description'),
    keywords: t.raw('keywords'),
    ...buildSocialMetadata({
      locale,
      path: '/blog',
      title: t('title'),
      description: t('description'),
      siteName: siteT('siteName')
    }),
    alternates: buildAlternates('/blog', locale)
  }
}

const BlogPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'BlogMetadata' })
  const siteT = await getTranslations({ locale, namespace: 'Metadata' })
  const blogPosts = await getPosts(undefined, locale)

  const newest = blogPosts[0]
  const oldestPublished = [...blogPosts].reverse().find(post => post.publishedAt)?.publishedAt

  const jsonLd = buildBlogPageJsonLd({
    locale,
    siteName: siteT('siteName'),
    siteDescription: siteT('description'),
    pageTitle: t('title'),
    pageDescription: t('description'),
    publishedAt: oldestPublished || newest?.publishedAt,
    updatedAt: newest?.updatedAt || newest?.publishedAt,
    posts: blogPosts.map(post => ({
      title: post.title,
      description: post.description,
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      authorName: post.author?.name
    }))
  })

  return (
    <>
      <div className='mb-16'>
        <BlogSection posts={blogPosts} />
      </div>

      <script {...jsonLdScriptProps(jsonLd)} />
    </>
  )
}

export default BlogPage
