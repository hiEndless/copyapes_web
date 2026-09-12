'use client'

export function getHashSectionId(href: string): string {
  if (href.startsWith('/#')) return href.slice(2)
  if (href.startsWith('#')) return href.slice(1)
  return ''
}

export function isHomePath(pathname: string | null | undefined): boolean {
  return pathname === '/' || pathname === ''
}

export function scrollToSectionId(sectionId: string, behavior: ScrollBehavior = 'smooth'): boolean {
  const element = document.getElementById(sectionId)
  if (!element) return false
  element.scrollIntoView({ behavior, block: 'start' })
  return true
}

/** Same-page hash jump without remounting the home route. */
export function handleHomeHashNavigation(
  event: { preventDefault: () => void },
  href: string,
  pathname: string | null | undefined
): boolean {
  const sectionId = getHashSectionId(href)
  if (!sectionId || !isHomePath(pathname)) return false

  event.preventDefault()
  const nextHash = `#${sectionId}`
  if (window.location.hash !== nextHash) {
    window.history.pushState(null, '', nextHash)
  }
  if (!scrollToSectionId(sectionId)) {
    // Below-fold dynamic sections may still be mounting.
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      if (scrollToSectionId(sectionId) || Date.now() - startedAt > 5000) {
        window.clearInterval(timer)
      }
    }, 50)
  }
  return true
}
