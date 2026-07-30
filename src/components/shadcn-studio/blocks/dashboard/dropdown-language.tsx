'use client'

import type { ReactNode } from 'react'

import { usePathname, useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'

import { LOCALE_OPTIONS } from '@/i18n/locales'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

const LanguageDropdown = ({ defaultOpen, align, trigger }: Props) => {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='w-50' align={align || 'end'}>
        <DropdownMenuRadioGroup value={locale} onValueChange={switchLocale}>
          {LOCALE_OPTIONS.map(option => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className='data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground flex items-center gap-2 pl-2 text-sm [&>span:first-child]:hidden'
            >
              <img src={option.flag} alt='' className='h-3.5 w-5 rounded-[1px] object-cover' />
              <span>{option.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageDropdown
