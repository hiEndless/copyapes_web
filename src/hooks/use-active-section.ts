'use client'

import { useEffect, useState } from 'react'

import { usePathname } from '@/i18n/routing'
import { scrollToSectionId } from '@/lib/in-page-hash'

function scrollToHashWhenReady(hash: string, sectionIds: string[], timeoutMs = 5000) {
  if (!hash || !sectionIds.includes(hash)) return () => {}

  let cancelled = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let observer: MutationObserver | null = null

  const tryScroll = () => {
    if (cancelled) return true
    if (!scrollToSectionId(hash)) return false
    return true
  }

  if (tryScroll()) return () => {}

  observer = new MutationObserver(() => {
    if (tryScroll()) {
      observer?.disconnect()
      observer = null
      if (timer) clearTimeout(timer)
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  timer = setTimeout(() => {
    observer?.disconnect()
    observer = null
    tryScroll()
  }, timeoutMs)

  return () => {
    cancelled = true
    observer?.disconnect()
    if (timer) clearTimeout(timer)
  }
}

export const useActiveSection = (sectionIds: string[]) => {
  const [activeSection, setActiveSection] = useState<string>('')

  const pathname = usePathname()

  // Reset active section when pathname changes (route navigation)
  useEffect(() => {
    setActiveSection('')
  }, [pathname])

  // Scroll to hash on load, route change, browser back/forward, and hashchange.
  useEffect(() => {
    let cleanup = scrollToHashWhenReady(window.location.hash.slice(1), sectionIds)

    const onHashOrHistory = () => {
      cleanup()
      cleanup = scrollToHashWhenReady(window.location.hash.slice(1), sectionIds)
    }

    window.addEventListener('hashchange', onHashOrHistory)
    window.addEventListener('popstate', onHashOrHistory)

    return () => {
      cleanup()
      window.removeEventListener('hashchange', onHashOrHistory)
      window.removeEventListener('popstate', onHashOrHistory)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        // Find all visible sections
        const visibleSections = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => {
            // Sort by how much of the section is visible (intersection ratio)
            // and by position on screen (top edge)
            const ratioComparison = b.intersectionRatio - a.intersectionRatio

            if (ratioComparison !== 0) return ratioComparison

            return a.boundingClientRect.top - b.boundingClientRect.top
          })

        // Set the most visible section as active, or clear if none are visible
        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id)
        } else {
          setActiveSection('')
        }
      },
      {
        rootMargin: '-20% 0px -35% 0px', // Adjust when sections become "active"
        threshold: [0, 0.25, 0.5, 0.75, 1] // Multiple thresholds for better detection
      }
    )

    // Observe all sections
    sectionIds.forEach(id => {
      const element = document.getElementById(id)

      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [sectionIds, pathname])

  return activeSection
}
