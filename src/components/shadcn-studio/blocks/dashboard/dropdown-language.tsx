'use client'

import type { ReactNode } from 'react'

import { usePathname, useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'

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
          <DropdownMenuRadioItem
            value='zh'
            className='data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground pl-2 text-base flex items-center gap-2 [&>span:first-child]:hidden'
          >
            <span className='text-base'>🇨🇳</span>
            <span>简体中文</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value='en'
            className='data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground pl-2 text-base flex items-center gap-2 [&>span:first-child]:hidden'
          >
            <span className='text-base'>🇺🇸</span>
            <span>English</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageDropdown
