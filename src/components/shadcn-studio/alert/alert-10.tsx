'use client'

import { useState } from 'react'

import { CircleAlertIcon, XIcon } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Alert10() {
  const [isActive, setIsActive] = useState(true)

  if (!isActive) return null

  return (
    <Alert className='border-accent-foreground/20 from-accent text-accent-foreground flex items-center gap-2 bg-gradient-to-b to-transparent to-60% py-1.5 pl-3 pr-2'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <CircleAlertIcon className='text-accent-foreground/90 size-3.5 shrink-0' />
        <AlertDescription className='text-accent-foreground/90 !block min-w-0 flex-1 text-left text-xs leading-snug'>
          交易加密货币衍生品涉及重大风险，并不适合所有投资者。程序只是交易辅助工具，有可能出错，请确保您自己始终是仓位风险的第一控制人。
        </AlertDescription>
      </div>
      <button
        type='button'
        className='text-accent-foreground/80 hover:text-accent-foreground shrink-0 p-0.5'
        onClick={() => setIsActive(false)}
      >
        <XIcon className='size-4' />
        <span className='sr-only'>关闭</span>
      </button>
    </Alert>
  )
}
