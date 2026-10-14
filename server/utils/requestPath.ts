import type { H3Event } from 'h3'

export function requestPath(event: H3Event): string {
  const path = event.path.split('?')[0]!.toLowerCase().replace(/\/{2,}/g, '/')

  return path.length > 1 ? path.replace(/\/$/, '') : path
}
