import type { TourDef } from './types'

type TourTranslator = {
  (key: string): string
  raw: (key: string) => unknown
}

/** 用 messages/Tour.tours.* 覆盖 registry 中的标题与描述 */
export function localizeTour(tour: TourDef, t: TourTranslator): TourDef {
  const base = `tours.${tour.id}`
  const stepsRaw = t.raw(`${base}.steps`)
  const localizedSteps = Array.isArray(stepsRaw)
    ? tour.steps.map((step, index) => {
        const localized = stepsRaw[index] as { title?: string; description?: string } | undefined

        return {
          ...step,
          title: localized?.title ?? step.title,
          description: localized?.description ?? step.description
        }
      })
    : tour.steps

  let title = tour.title
  let unavailableHint = tour.unavailableHint

  try {
    title = t(`${base}.title`)
  } catch {
    // keep registry fallback
  }

  if (tour.unavailableHint) {
    try {
      unavailableHint = t(`${base}.unavailableHint`)
    } catch {
      // keep registry fallback
    }
  }

  return {
    ...tour,
    title,
    unavailableHint,
    steps: localizedSteps
  }
}
