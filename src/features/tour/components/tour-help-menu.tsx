'use client'

import { CircleHelpIcon, RotateCcwIcon } from 'lucide-react'

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
  const { pageTour, featureTours, startTour, resetProgress } = useTour()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' title='新手指引' {...tourAnchor(TOUR_ANCHORS.headerTour)}>
          <CircleHelpIcon />
          <span className='sr-only'>新手指引</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-52'>
        <DropdownMenuLabel>新手指引</DropdownMenuLabel>
        {pageTour ? (
          <DropdownMenuItem onSelect={() => startTour(pageTour)}>{pageTour.title}</DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>本页暂无指引</DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>功能点介绍</DropdownMenuSubTrigger>
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
          重置引导记录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TourHelpMenu
