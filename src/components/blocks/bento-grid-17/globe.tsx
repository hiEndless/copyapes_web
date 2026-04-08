'use client'

import { useEffect, useRef } from 'react'

import type { COBEOptions } from 'cobe'
import createGlobe from 'cobe'
import { useInView, useMotionValue, useSpring } from 'motion/react'

import { cn } from '@/lib/utils'

const MOVEMENT_DAMPING = 1400

/** 降低 mapSamples / DPR，减轻 WebGL 负载；接近视口才初始化 */
const GLOBE_CONFIG: COBEOptions & { onRender?: (state: any) => void } = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 1.5,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 5500,
  mapBrightness: 2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 }
  ]
}

const Globe = ({ className }: { className?: string; config?: COBEOptions }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const phiRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)

  const r = useMotionValue(0)

  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100
  })

  const inView = useInView(containerRef, {
    once: true,
    margin: '0px 0px 200px 0px'
  })

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value

    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? 'grabbing' : 'grab'
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current

      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }

  useEffect(() => {
    if (!inView || !canvasRef.current) return

    const canvas = canvasRef.current
    let globe: { destroy: () => void } | null = null

    const tryCreate = () => {
      if (globe) return

      const width = canvas.offsetWidth
      if (width < 1) return

      const dpr = Math.min(1.25, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
      const buffer = Math.max(256, Math.round(width * dpr))

      globe = createGlobe(canvas, {
        ...GLOBE_CONFIG,
        devicePixelRatio: dpr,
        width: buffer,
        height: buffer,
        onRender: (state: any) => {
          if (!pointerInteracting.current) phiRef.current += 0.005
          state.phi = phiRef.current + rs.get()
          state.width = buffer
          state.height = buffer
        }
      } as any)

      setTimeout(() => {
        canvas.style.opacity = '1'
      }, 0)
    }

    tryCreate()
    const ro = new ResizeObserver(() => tryCreate())
    ro.observe(canvas)

    return () => {
      ro.disconnect()
      globe?.destroy()
    }
  }, [inView, rs])

  return (
    <div ref={containerRef} className={cn('absolute mx-auto w-full', className)}>
      <canvas
        className={cn('size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]')}
        ref={canvasRef}
        onPointerDown={e => {
          pointerInteracting.current = e.clientX
          updatePointerInteraction(e.clientX)
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={e => updateMovement(e.clientX)}
        onTouchMove={e => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  )
}

export default Globe
