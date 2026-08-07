export const docsNavigations = [
  {
    titleKey: 'navDocs',
    href: '/docs'
  },
  {
    titleKey: 'navHome',
    href: '/',
    external: false
  },
  {
    titleKey: 'navBlog',
    href: '/blog'
  }
] as const

export type DocsNavigationTitleKey = (typeof docsNavigations)[number]['titleKey']

/** Client-safe defaults; mirrors content github.ts fallbacks. */
export function getDocsGithubLink() {
  const username =
    process.env.NEXT_PUBLIC_CONTENT_GITHUB_USERNAME ||
    process.env.CONTENT_GITHUB_USERNAME ||
    'hiEndless'
  const repo =
    process.env.NEXT_PUBLIC_CONTENT_GITHUB_REPO || process.env.CONTENT_GITHUB_REPO || 'copyapes_content'

  return {
    href: `https://github.com/${username}/${repo}`
  }
}

export const docsBrand = {
  name: 'CopyApes',
  link: 'https://copyapes.com',
  siteicon: '/site_logo/logo-small.png'
} as const

export const docsSettings = {
  rightbar: true,
  toc: true,
  feedback: false,
  totop: true
} as const
