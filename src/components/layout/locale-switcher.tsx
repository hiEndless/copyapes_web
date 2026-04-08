'use client'

import { GlobeIcon } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { SecondaryFlowButton } from '@/components/ui/flow-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useLocale } from 'next-intl'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SecondaryFlowButton size='icon-lg' className='relative' aria-label='Toggle language'>
          <GlobeIcon className='size-5' />
        </SecondaryFlowButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => switchLocale('zh')} className='flex items-center gap-2'>
          <span className='text-base'>🇨🇳</span>
          <span>简体中文</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('en')} className='flex items-center gap-2'>
          <span className='text-base'>🇺🇸</span>
          <span>English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
