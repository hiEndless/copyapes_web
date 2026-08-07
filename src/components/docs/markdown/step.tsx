import { Children, type PropsWithChildren, type ReactNode } from 'react'
import { clsx } from 'clsx'

import { cn } from '@/lib/utils'

interface StepProps {
  children: ReactNode
}

interface StepItemProps {
  children: ReactNode
  title?: string
}

export function Step({ children }: PropsWithChildren<StepProps>) {
  const length = Children.count(children)

  return (
    <div className='flex flex-col gap-2'>
      {Children.map(children, (child, index) => (
        <div className={cn('relative border-l pl-9', clsx({ 'pb-8': index < length - 1 }))}>
          <div className='bg-secondary absolute -left-4 flex size-8 items-center justify-center rounded-full border text-xs font-medium'>
            {index + 1}
          </div>
          {child}
        </div>
      ))}
    </div>
  )
}

export function StepItem({ children, title }: StepItemProps) {
  return (
    <div className='space-y-4 pt-0.5!'>
      {title ? <h3 className='mt-0! mb-3!'>{title}</h3> : null}
      <div className='space-y-4'>{children}</div>
    </div>
  )
}
