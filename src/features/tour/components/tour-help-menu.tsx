'use client'

import { CircleHelpIcon, RotateCcwIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { TOUR_ANCHORS, tourAnchor } from '../anchors'
import { useTour } from '../tour-provider'

const TourHelpMenu = () => {
  const t = useTranslations('DashboardShell.tour')
  const { pageTour, featureTours, startTour, resetProgress } = useTour()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' title={t('title')} {...tourAnchor(TOUR_ANCHORS.headerTour)}>
          <CircleHelpIcon />
          <span className='sr-only'>{t('title')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-52'>
        <DropdownMenuLabel>{t('title')}</DropdownMenuLabel>
        {pageTour ? (
          <DropdownMenuItem onSelect={() => startTour(pageTour)}>{pageTour.title}</DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>{t('empty')}</DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t('features')}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className='w-44'>
            {featureTours.map(tour => (
              <DropdownMenuItem key={tour.id} onSelect={() => startTour(tour)}>
                {tour.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={resetProgress}>
          <RotateCcwIcon />
          {t('reset')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TourHelpMenu
