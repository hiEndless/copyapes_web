'use client'

import { Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { useMounted } from '@/components/docs/use-mounted'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LOCALE_OPTIONS } from '@/i18n/locales'
import { usePathname, useRouter } from '@/i18n/routing'

export function DocsLocaleSwitcher() {
  const mounted = useMounted()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('Docs')

  const switchLocale = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale })
  }

  if (!mounted) {
    return (
      <Button
        aria-label={t('toggleLanguage')}
        className='h-9 w-9 cursor-pointer'
        size='icon'
        type='button'
        variant='outline'
      >
        <Globe className='size-4' />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t('toggleLanguage')}
          className='h-9 w-9 cursor-pointer'
          size='icon'
          variant='outline'
        >
          <Globe className='size-4' />
        </Button>
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
