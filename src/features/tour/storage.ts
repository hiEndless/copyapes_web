import type { TourDef } from './types'

const STORAGE_KEY = 'copyapes.tour.progress.v1'

/** tourId -> 已看过的版本号 */
type TourProgress = Record<string, number>

const readProgress = (): TourProgress => {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) return {}

    const parsed = JSON.parse(raw) as unknown

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return parsed as TourProgress
  } catch {
    return {}
  }
}

const writeProgress = (progress: TourProgress) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error('Failed to persist tour progress', error)
  }
}

export const hasSeenTour = (tour: TourDef) => (readProgress()[tour.id] ?? 0) >= tour.version

export const markTourSeen = (tour: TourDef) => {
  const progress = readProgress()

  if (progress[tour.id] === tour.version) return

  progress[tour.id] = tour.version
  writeProgress(progress)
}

export const resetAllTours = () => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to reset tour progress', error)
  }
}
