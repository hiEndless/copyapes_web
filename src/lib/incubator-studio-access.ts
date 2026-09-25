export type StudioAccessStatus = 'ACTIVE' | 'INACTIVE' | 'UNAVAILABLE' | 'NOT_ENFORCED'

export const canCreateOrStart = (status: StudioAccessStatus | null): boolean =>
  status === 'ACTIVE' || status === 'NOT_ENFORCED'

export function parseStudioAccess(payload: unknown): StudioAccessStatus {
  if (!payload || typeof payload !== 'object') throw new Error('studio_access_response_invalid')
  const value = payload as Record<string, unknown>
  const status = value.status

  if (status !== 'ACTIVE' && status !== 'INACTIVE' && status !== 'UNAVAILABLE' && status !== 'NOT_ENFORCED') {
    throw new Error('studio_access_response_invalid')
  }

  if (value.can_create_or_start !== canCreateOrStart(status)) {
    throw new Error('studio_access_response_invalid')
  }

  return status
}
