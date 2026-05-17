import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import CTASection from '@/components/blocks/cta/cta'
import HeroSection from '@/components/blog/hero-section/hero-section'
import SectionSeparator from '@/components/section-separator'
import BlogSection from '@/components/blog/blog-section/blog-section'
import { getPosts } from '@/lib/posts'
import { buildAlternates, buildBlogPageJsonLd, jsonLdScriptProps } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'BlogMetadata' })

  return {
    title: t('title'),
    description: t('description'),
    keywords: t.raw('keywords'),
    alternates: buildAlternates('/blog', locale)
  }
}

const BlogPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'BlogMetadata' })
  const siteT = await getTranslations({ locale, namespace: 'Metadata' })
  const blogPosts = await getPosts()
  const featuredPosts = blogPosts.filter(post => post.featured)
  const jsonLd = buildBlogPageJsonLd({
    locale,
    siteName: siteT('siteName'),
    siteDescription: siteT('description'),
    pageTitle: t('title'),
    pageDescription: t('description')
  })

  return (
    <>
      <HeroSection posts={featuredPosts} />

      <SectionSeparator />

      <BlogSection posts={blogPosts} />

      <CTASection />

      <script {...jsonLdScriptProps(jsonLd)} />
    </>
  )
}

export default BlogPage
