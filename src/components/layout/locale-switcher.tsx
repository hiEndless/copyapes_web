'use client'

import { GlobeIcon } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/routing'
import { SecondaryFlowButton } from '@/components/ui/flow-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useLocale } from 'next-intl'

import { LOCALE_OPTIONS } from '@/i18n/locales'

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
        {LOCALE_OPTIONS.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => switchLocale(option.value)}
            className={`flex items-center gap-2 text-sm ${locale === option.value ? 'bg-accent' : ''}`}
          >
            <img src={option.flag} alt='' className='h-3.5 w-5 rounded-[1px] object-cover' />
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
