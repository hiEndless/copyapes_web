import type { UserInfo } from '@/api/auth'

export function persistAuthSession(user: UserInfo): void {
  localStorage.setItem('token', user.token)
  localStorage.setItem('userInfo', JSON.stringify(user))
  document.cookie = `token=${user.token}; path=/; max-age=1209600;` // 14 days
}
