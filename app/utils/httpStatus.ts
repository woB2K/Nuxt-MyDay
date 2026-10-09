export function statusOf(error: unknown): number | undefined {
  return (error as { statusCode?: number, status?: number })?.statusCode
    ?? (error as { status?: number })?.status
}
