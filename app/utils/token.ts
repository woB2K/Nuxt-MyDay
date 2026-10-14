export function tokenSubject(token: string | null | undefined): string | undefined {
  const payload = token?.split('.')[1]

  if (!payload) return undefined

  try {
    const { sub } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { sub?: unknown }

    return typeof sub === 'string' ? sub : undefined
  } catch {
    return undefined
  }
}
