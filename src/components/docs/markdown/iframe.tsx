import type { IframeHTMLAttributes } from 'react'

type DocsIframeProps = IframeHTMLAttributes<HTMLIFrameElement> & {
  frameborder?: string | number
  allowfullscreen?: string | boolean
  framespacing?: string | number
  scrolling?: string
  border?: string | number
}

function toBool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (normalized === '' || normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0') return false
  }

  return Boolean(value)
}

function toFrameBorder(value: unknown): number {
  if (value === 'no' || value === undefined || value === null || value === '') return 0
  const n = Number(value)

  return Number.isFinite(n) ? n : 0
}

/** Normalize HTML iframe attrs from MDX into React camelCase boolean/number props. */
export function DocsIframe({
  frameborder,
  allowfullscreen,
  framespacing: _framespacing,
  scrolling: _scrolling,
  border: _border,
  frameBorder,
  allowFullScreen,
  ...rest
}: DocsIframeProps) {
  const normalizedAllowFullScreen =
    toBool(allowFullScreen) ?? toBool(allowfullscreen) ?? true

  return (
    <iframe
      {...rest}
      allowFullScreen={normalizedAllowFullScreen === true}
      frameBorder={toFrameBorder(frameBorder ?? frameborder)}
    />
  )
}
