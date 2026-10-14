import type { UserProfile } from '~~/shared/types'

const SESSION_KEY = 'myday:session'

export function rememberSession(profile: UserProfile) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile))
  } catch {}
}

export function recallSession(): UserProfile | null {
  try {
    const profile = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as Partial<UserProfile> | null

    if (typeof profile?.id !== 'string' || typeof profile.settings !== 'object' || !profile.settings) return null

    return profile as UserProfile
  } catch {
    return null
  }
}

export function forgetSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {}
}
