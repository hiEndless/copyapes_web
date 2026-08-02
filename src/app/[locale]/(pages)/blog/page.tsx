import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import BlogSection from '@/components/blog/blog-section/blog-section'
import { Link } from '@/i18n/routing'
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
      title: t('pageHeading'),
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
  const faqs = [
    { question: t('faq1q'), answer: t('faq1a') },
    { question: t('faq2q'), answer: t('faq2a') },
    { question: t('faq3q'), answer: t('faq3a') }
  ]

  const jsonLd = buildBlogPageJsonLd({
    locale,
    siteName: siteT('siteName'),
    siteDescription: siteT('description'),
    pageTitle: t('pageHeading'),
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
    })),
    faqs
  })

  return (
    <>
      <section className='mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16'>
        <div className='mx-auto max-w-3xl space-y-4 text-center'>
          <h1 className='text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl'>{t('pageHeading')}</h1>
          <p className='text-muted-foreground text-lg leading-8 md:text-xl'>{t('intro')}</p>
          <p className='text-muted-foreground text-sm leading-6'>
            {t('citationNote')}{' '}
            <Link href='/blog/copy-trading-loss-lesson-1' className='text-primary underline-offset-4 hover:underline'>
              copy-trading-loss-lesson-1
            </Link>
            {' · '}
            <Link href='/terms' className='text-primary underline-offset-4 hover:underline'>
              /terms
            </Link>
            {' · '}
            <Link href='/about' className='text-primary underline-offset-4 hover:underline'>
              /about
            </Link>
            {' · '}
            <Link href='/#contact' className='text-primary underline-offset-4 hover:underline'>
              /#contact
            </Link>
          </p>
        </div>

        <div className='mx-auto mt-12 grid max-w-5xl gap-10 md:grid-cols-2'>
          <div className='space-y-3 text-left'>
            <h2 className='text-xl font-semibold md:text-2xl'>{t('topicsHeading')}</h2>
            <p className='text-muted-foreground leading-7'>{t('topicsBody')}</p>
          </div>
          <div className='space-y-3 text-left'>
            <h2 className='text-xl font-semibold md:text-2xl'>{t('listHeading')}</h2>
            <p className='text-muted-foreground leading-7'>{t('listIntro')}</p>
            <ul className='text-muted-foreground space-y-2 text-sm leading-6'>
              {blogPosts.slice(0, 8).map(post => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className='text-foreground hover:text-primary underline-offset-4 hover:underline'>
                    {post.title}
                  </Link>
                  {post.publishedAt ? <span className='text-muted-foreground'> — {post.publishedAt}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='mx-auto mt-12 max-w-3xl space-y-4 text-left'>
          <h2 className='text-xl font-semibold md:text-2xl'>{t('faqHeading')}</h2>
          <dl className='space-y-4'>
            {faqs.map(faq => (
              <div key={faq.question} className='space-y-1'>
                <dt className='font-medium'>{faq.question}</dt>
                <dd className='text-muted-foreground leading-7'>{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className='mb-16'>
        <BlogSection posts={blogPosts} />
      </div>

      <script {...jsonLdScriptProps(jsonLd)} />
    </>
  )
}

export default BlogPage
