import type { JSX } from 'react'

import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote-client/rsc'

import { Card, CardGrid } from '@/components/docs/markdown/card'
import { File, FileTree, Folder } from '@/components/docs/markdown/filetree'
import { DocsIframe } from '@/components/docs/markdown/iframe'
import { DocsRoute } from '@/components/docs/markdown/link'
import { Mermaid } from '@/components/docs/markdown/mermaid'
import { DocsIcon } from '@/components/docs/markdown/icon'
import { Note } from '@/components/docs/markdown/note'
import { DocsPre } from '@/components/docs/markdown/pre'
import { Step, StepItem } from '@/components/docs/markdown/step'
import CompareTable from '@/components/mdx/compare-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { docsMdxOptions } from '@/lib/docs/mdx-options'

function Danger({ children }: { children?: React.ReactNode }) {
  return (
    <Note title='危险' type='danger'>
      {children}
    </Note>
  )
}

function Tip({ children }: { children?: React.ReactNode }) {
  return (
    <Note title='提示' type='note'>
      {children}
    </Note>
  )
}

function Info({ children }: { children?: React.ReactNode }) {
  return (
    <Note title='说明' type='note'>
      {children}
    </Note>
  )
}

function Warning({ children }: { children?: React.ReactNode }) {
  return (
    <Note title='注意' type='warning'>
      {children}
    </Note>
  )
}

const components: MDXRemoteProps['components'] = {
  a: DocsRoute,
  iframe: DocsIframe,
  Card,
  CardGrid,
  FileTree,
  Folder,
  File,
  Mermaid,
  Note,
  Icon: DocsIcon,
  Danger,
  Tip,
  Info,
  Warning,
  pre: DocsPre,
  Step,
  StepItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  CompareTable
}

const DocsMDXContent = (props: JSX.IntrinsicAttributes & MDXRemoteProps) => {
  return (
    <div className='docs-mdx-stack'>
      <MDXRemote
        {...props}
        components={{ ...components, ...(props.components || {}) }}
        options={{
          ...props.options,
          mdxOptions: {
            ...docsMdxOptions,
            ...props.options?.mdxOptions
          }
        }}
      />
    </div>
  )
}

export default DocsMDXContent
