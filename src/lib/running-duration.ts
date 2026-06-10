export const LAUNCH_DATE = new Date(2024, 0, 1)

export function getRunningDuration(startDate: Date, now = new Date()) {
  let years = now.getFullYear() - startDate.getFullYear()
  let months = now.getMonth() - startDate.getMonth()

  if (now.getDate() < startDate.getDate()) {
    months--
  }

  if (months < 0) {
    years--
    months += 12
  }

  return { years, months }
}
