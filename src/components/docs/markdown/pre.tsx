import type { ComponentProps } from 'react'

import { DocsCopy } from '@/components/docs/markdown/copy'

export function DocsPre({ children, raw, ...rest }: ComponentProps<'pre'> & { raw?: string }) {
  return (
    <div className='relative my-5'>
      <div className='absolute top-3 right-2.5 z-10 hidden sm:block'>
        <DocsCopy content={raw || ''} />
      </div>
      <div className='relative'>
        <pre {...rest}>{children}</pre>
      </div>
    </div>
  )
}
