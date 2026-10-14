import { statusOf } from '~/utils/httpStatus'

export function isOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

export function isTransportError(error: unknown): boolean {
  return statusOf(error) === undefined && (error as { name?: unknown } | null)?.name === 'FetchError'
}
