// Canonical contract: contracts/mappings/grab_leader_identity_v1.json in the API repository.
export const OKX_UNIQUE_NAME_PATTERN = '[0-9a-fA-F]{16}'
export const BINANCE_UNIQUE_NAME_PATTERN = '[0-9]+'

export function normalizeGrabLeaderId(value: unknown, exchange: number): string | null {
  if (typeof value !== 'string') return null
  const id = value.trim()
  const pattern = exchange === 2 ? BINANCE_UNIQUE_NAME_PATTERN : OKX_UNIQUE_NAME_PATTERN
  const match = id.match(new RegExp(`^(?:${pattern})$`))

  return match && match[0] === id ? id : null
}
