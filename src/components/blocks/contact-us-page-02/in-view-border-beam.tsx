'use client'

import { useRef } from 'react'

import { useInView } from 'motion/react'

import { BorderBeam } from '@/components/ui/border-beam'

export function InViewBorderBeam() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, {
    margin: '0px 0px 180px 0px',
    amount: 0.05
  })

  return (
    <div ref={ref} className='pointer-events-none absolute inset-0 rounded-[inherit]'>
      {inView ? <BorderBeam size={250} duration={14} delay={9} /> : null}
    </div>
  )
}
