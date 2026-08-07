import { ArrowUpRight } from 'lucide-react'

import { getDocsEditUrl, getDocsFeedbackUrl } from '@/lib/docs/settings'

interface FeedbackProps {
  contentPath: string
  title: string
}

export function DocsFeedback({ contentPath, title }: FeedbackProps) {
  const feedbackUrl = getDocsFeedbackUrl(title)
  const editUrl = getDocsEditUrl(contentPath)

  return (
    <div className='flex flex-col gap-3 pl-2'>
      <h3 className='text-sm font-semibold'>Content</h3>
      <div className='flex flex-col gap-2'>
        <a
          aria-label='Give Feedback'
          className='text-foreground flex items-center text-sm'
          href={feedbackUrl}
          rel='noopener noreferrer'
          target='_blank'
          title='Give Feedback'
        >
          <ArrowUpRight className='mr-1 inline-block h-4 w-4' />
          <span>Feedback</span>
        </a>
        <a
          aria-label='Edit this page'
          className='text-foreground flex items-center text-sm'
          href={editUrl}
          rel='noopener noreferrer'
          target='_blank'
          title='Edit this page'
        >
          <ArrowUpRight className='mr-1 inline-block h-4 w-4' />
          <span>Edit page</span>
        </a>
      </div>
    </div>
  )
}
