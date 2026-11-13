export type DashboardRoles = { is_admin: boolean; is_partner: boolean }
export type DashboardAccessSnapshot = {
  identity: string
  status: 'checking' | 'ready' | 'denied'
  roles: DashboardRoles
}
export const EMPTY_DASHBOARD_ACCESS: DashboardAccessSnapshot = {
  identity: '', status: 'checking', roles: { is_admin: false, is_partner: false }
}

export function dashboardRoleForPath(pathname: string): keyof DashboardRoles | null {
  const match = pathname.match(/^\/(?:[^/]+\/)?dashboard\/(admin|partner)(?:\/|$)/)

  return match?.[1] === 'admin' ? 'is_admin' : match?.[1] === 'partner' ? 'is_partner' : null
}

export function dashboardRolesFromResponse(response: unknown): DashboardRoles | null {
  if (!response || typeof response !== 'object') return null
  const result = response as { code?: unknown; data?: Partial<DashboardRoles> }

  if (result.code !== 0 || !result.data || typeof result.data !== 'object') return null

  return { is_admin: result.data.is_admin === true, is_partner: result.data.is_partner === true }
}

// Memory only. Each refresh invalidates earlier requests, including failure/role-revocation races.
export function createDashboardAccessStore() {
  let snapshot = EMPTY_DASHBOARD_ACCESS
  let generation = 0
  const listeners = new Set<() => void>()

  const publish = (next: DashboardAccessSnapshot) => {
    snapshot = next
    listeners.forEach(listener => listener())
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)

      return () => { listeners.delete(listener) }
    },
    invalidate: () => {
      generation++
      publish(EMPTY_DASHBOARD_ACCESS)
    },
    verify: async (identity: string, load: () => Promise<unknown>) => {
      const requestId = ++generation

      publish({ ...EMPTY_DASHBOARD_ACCESS, identity })
      let roles: DashboardRoles | null = null

      try {
        roles = dashboardRolesFromResponse(await load())
      } catch {
        // Network/auth failures must never restore cached privileges.
      }

      if (requestId !== generation) return
      publish({ identity, status: roles ? 'ready' : 'denied', roles: roles || EMPTY_DASHBOARD_ACCESS.roles })
    }
  }
}
