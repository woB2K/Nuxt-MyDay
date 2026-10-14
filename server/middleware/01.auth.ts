import { requestPath } from '~~/server/utils/requestPath'

const PUBLIC_PREFIXES = ['/api/auth/', '/api/_nuxt_icon']

function unauthorized() {
  return createError({ statusCode: 401, message: 'Unauthorized' })
}

export default defineEventHandler(async (event) => {
  Object.defineProperty(event.context, 'userId', {
    configurable: true,
    get() {
      throw unauthorized()
    }
  })

  const path = requestPath(event)

  if (!path.startsWith('/api')) return

  if (PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix))) return

  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '')

  if (!token) throw unauthorized()

  try {
    const userId = await verifyAccessToken(token)
    Object.defineProperty(event.context, 'userId', { value: userId, configurable: true, enumerable: true, writable: true })
  } catch {
    throw unauthorized()
  }
})
