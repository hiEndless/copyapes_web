import type { JSX } from 'react'

import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote-client/rsc'

import CompareTable from '@/components/mdx/compare-table'

// Helper function to generate slug from text
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

const components: MDXRemoteProps['components'] = {
  h1: ({ children }) => <h1 className='text-4xl font-bold'>{children}</h1>,
  h2: ({ children }) => {
    const slug = generateSlug(children as string)

    return (
      <h2 id={slug} className='mt-6 scroll-mt-20 text-3xl font-semibold'>
        {children}
      </h2>
    )
  },
  h3: ({ children }) => {
    const slug = generateSlug(children as string)

    return (
      <h3 id={slug} className='mt-4 scroll-mt-20 text-xl font-medium'>
        {children}
      </h3>
    )
  },
  h4: ({ children }) => {
    const slug = generateSlug(children as string)

    return (
      <h4 id={slug} className='mt-4 scroll-mt-20 text-lg font-medium'>
        {children}
      </h4>
    )
  },
  p: ({ children }) => <p className='text-muted-foreground mt-4 text-base'>{children}</p>,
  ul: ({ children }) => <ul className='mt-4 list-disc pl-6'>{children}</ul>,
  ol: ({ children }) => <ol className='mt-4 list-decimal pl-6'>{children}</ol>,
  li: ({ children }) => <li className='text-muted-foreground mt-2'>{children}</li>,
  hr: () => <hr className='my-8 border-0' />,
  pre: ({ children }) => <pre className='bg-muted my-6 overflow-x-auto rounded-lg p-4'>{children}</pre>,
  code: ({ children }) => <code className='bg-muted rounded font-mono text-sm'>{children}</code>,
  a: ({ href, children }) => (
    <a href={href} className='text-primary underline-offset-4 hover:underline' rel='noopener noreferrer'>
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img src={src} alt={alt ?? ''} className='my-6 max-h-110 w-full rounded-xl object-cover' />
  ),
  blockquote: ({ children }) => (
    <blockquote className='text-muted-foreground my-4 border-l-2 pl-4 italic'>{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className='border-border my-6 overflow-x-auto rounded-xl border'>
      <table className='w-full min-w-[36rem] border-collapse text-left text-sm'>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className='bg-muted/60'>{children}</thead>,
  tbody: ({ children }) => <tbody className='divide-border divide-y'>{children}</tbody>,
  tr: ({ children }) => <tr className='even:bg-muted/20'>{children}</tr>,
  th: ({ children }) => (
    <th className='text-foreground px-4 py-3 text-sm font-semibold whitespace-nowrap'>{children}</th>
  ),
  td: ({ children }) => <td className='text-muted-foreground px-4 py-3 align-top leading-6'>{children}</td>,
  CompareTable
}

const MDXContent = (props: JSX.IntrinsicAttributes & MDXRemoteProps) => {
  return <MDXRemote {...props} components={{ ...components, ...(props.components || {}) }} />
}

export default MDXContent
