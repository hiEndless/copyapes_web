/** Remaining whole days until VIP API capacity membership expires. */
export function remainingVipCapacityDays(value?: string | null): number | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const ms = date.getTime() - Date.now()
  if (ms <= 0) return 0
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}
