import { listContent } from '@/lib/content'
import { getCanonicalUrl, getSiteUrl } from '@/lib/seo'

export const revalidate = 3600

export async function GET() {
  const siteUrl = getSiteUrl()
  const [postsEn, postsZh, tutorialsEn, tutorialsZh] = await Promise.all([
    listContent('blog', 'en'),
    listContent('blog', 'zh'),
    listContent('tutorials', 'en'),
    listContent('tutorials', 'zh')
  ])

  const postsZhBySlug = new Map(postsZh.map(post => [post.slug, post]))
  const tutorialsZhBySlug = new Map(tutorialsZh.map(item => [item.slug, item]))

  const blogLines = postsEn.flatMap(post => {
    const zh = postsZhBySlug.get(post.slug)
    const lines = [`- [${post.title}](${getCanonicalUrl(`/blog/${post.slug}`, 'en')})`]

    if (zh) {
      lines.push(`- [中文：${zh.title}](${getCanonicalUrl(`/blog/${post.slug}`, 'zh')})`)
    }

    return lines
  })

  const docsSource = tutorialsEn.length > 0 ? tutorialsEn : tutorialsZh
  const docsLines =
    docsSource.length > 0
      ? docsSource.flatMap(item => {
          const zh = tutorialsZhBySlug.get(item.slug)
          const lines = [`- [${item.title}](${getCanonicalUrl(`/docs/${item.slug}`, 'en')})`]

          if (zh && tutorialsEn.length > 0) {
            lines.push(`- [中文：${zh.title}](${getCanonicalUrl(`/docs/${item.slug}`, 'zh')})`)
          }

          return lines
        })
      : [`- [Docs](${getCanonicalUrl('/docs', 'en')})`]

  docsLines.push(`- [Product protocol / Terms](${getCanonicalUrl('/terms', 'en')})`)

  const body = `# CopyApes (跟单猿)

> Cross-exchange automated crypto futures copy-trading assistant.
> Official site: ${siteUrl}

## Product
- Automated copy trading via official exchange APIs
- Cross-exchange following (e.g. OKX account following Binance traders)
- Funds remain in the user's own exchange account
- No profit-share seat fee from copy trades
- Free trial tier available

## Key pages
- [Home](${getCanonicalUrl('', 'en')})
- [About](${getCanonicalUrl('/about', 'en')})
- [Blog](${getCanonicalUrl('/blog', 'en')})
- [Docs](${getCanonicalUrl('/docs', 'en')})
- [Privacy Policy](${getCanonicalUrl('/privacy', 'en')})
- [Terms of Service](${getCanonicalUrl('/terms', 'en')})
- [Chinese home](${getCanonicalUrl('', 'zh')})
- [Contact](${siteUrl}/#contact)

## Blog
${blogLines.length > 0 ? blogLines.join('\n') : '- (No published posts yet)'}

## Docs
${docsLines.join('\n')}

## Contact
- Email: service@copyapes.com
- Telegram (EN support): https://t.me/copyapes_admin
- Telegram (CN community): https://t.me/copyapes_cn
- Contact form: ${siteUrl}/#contact
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
