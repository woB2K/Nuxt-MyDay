export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api')) return

  if (path.includes('/api/auth/')) return

  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '')

  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  try {
    const userId = await verifyAccessToken(token)
    event.context.userId = userId
  } catch {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
})
