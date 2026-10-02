import type { H3Event } from 'h3'

const REFRESH_COOKIE = 'refreshToken'
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30

function baseOptions() {
  return {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax' as const
  }
}

export function setRefreshCookie(event: H3Event, token: string): void {
  setCookie(event, REFRESH_COOKIE, token, { ...baseOptions(), maxAge: REFRESH_MAX_AGE })
}

export function clearRefreshCookie(event: H3Event): void {
  deleteCookie(event, REFRESH_COOKIE, baseOptions())
}
