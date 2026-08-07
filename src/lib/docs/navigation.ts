export const docsNavigations = [
  {
    title: 'Docs',
    href: '/docs'
  },
  {
    title: 'Home',
    href: '/',
    external: false
  },
  {
    title: 'Blog',
    href: '/blog'
  }
] as const

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
  title: 'CopyApes Docs',
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
