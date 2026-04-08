'use client'

import { useEffect, useState } from 'react'

import { motion, type Transition } from 'motion/react'
import Autoplay from 'embla-carousel-autoplay'

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Checkbox } from '@/components/ui/motion-checkbox'
import { Label } from '@/components/ui/label'

const checkboxItems = [
  {
    id: 1,
    label: 'Find bug from landing page',
    defaultChecked: false
  },
  {
    id: 2,
    label: 'Present a bug as a feature',
    defaultChecked: false
  },
  {
    id: 3,
    label: 'Design new bento blocks',
    defaultChecked: false
  },
  {
    id: 4,
    label: 'Resolve new queries',
    defaultChecked: false
  },
  {
    id: 5,
    label: 'Present a bug as a feature',
    defaultChecked: false
  }
]

const getPathAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0
})

const getPathTransition = (isChecked: boolean): Transition => ({
  pathLength: { duration: 1, ease: 'easeInOut' },
  opacity: {
    duration: 0.01,
    delay: isChecked ? 0 : 1
  }
})

const Checklist = () => {
  const [checked, setChecked] = useState(checkboxItems.map(i => !!i.defaultChecked))

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  useEffect(() => {
    // Check current item and uncheck the item that is 3 positions behind (with wrap-around)
    setChecked(prev =>
      prev.map((_, index) => {
        // Check the current item
        if (index === current) return true

        // Calculate which item should be unchecked (3 positions behind with wrap-around)
        const itemToUncheck = (current - 3 + checkboxItems.length) % checkboxItems.length

        // Uncheck the item that is 3 positions behind (circular)
        if (index === itemToUncheck) return false

        // Keep the state of all other items
        return prev[index]
      })
    )
  }, [current])

  return (
    <div>
      <Carousel
        opts={{
          align: 'center',
          loop: true,
          slidesToScroll: 1
        }}
        plugins={[Autoplay({ delay: 1500, stopOnInteraction: false })]}
        orientation='vertical'
        setApi={setApi}
      >
        <CarouselContent className='-mt-4 max-h-32'>
          {checkboxItems.map((task, index) => (
            <CarouselItem key={task.id} className='pt-4'>
              <div className='flex items-center gap-3'>
                <Checkbox
                  className='grid size-6 place-content-center [&_svg]:size-4.5'
                  checked={checked[index]}
                  onCheckedChange={val => {
                    const updated = [...checked]

                    updated[index] = val === true
                    setChecked(updated)
                  }}
                  id={`checkbox-${task.id}`}
                />
                <div className='relative inline-block'>
                  <Label htmlFor={`checkbox-${task.id}`}>{task.label}</Label>
                  <motion.svg
                    width='340'
                    height='32'
                    viewBox='0 0 340 32'
                    className='pointer-events-none absolute top-1/2 left-0 z-20 h-10 w-full -translate-y-1/2'
                  >
                    <motion.path
                      d='M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36'
                      vectorEffect='non-scaling-stroke'
                      strokeWidth={2}
                      strokeLinecap='round'
                      strokeMiterlimit={10}
                      fill='none'
                      initial={false}
                      animate={getPathAnimate(!!checked[index])}
                      transition={getPathTransition(!!checked[index])}
                      className='stroke-neutral-900 dark:stroke-neutral-100'
                    />
                  </motion.svg>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

export default Checklist
