import { requestPath } from '../utils/requestPath'

const DEMO_LOCKED: Array<{ method: string, path: RegExp }> = [
  { method: 'PUT', path: /^\/api\/settings\/pin$/ },
  { method: 'DELETE', path: /^\/api\/settings\/pin$/ },
  { method: 'POST', path: /^\/api\/settings\/pin\/reset$/ },
  { method: 'PATCH', path: /^\/api\/household$/ },
  { method: '*', path: /^\/api\/household\/(?:invite|join|leave|members)(?:\/|$)/ }
]

export default defineEventHandler((event) => {
  if (String(useRuntimeConfig(event).demo) !== 'true') return

  const path = requestPath(event)
  const method = event.method.toUpperCase()

  if (method === 'GET') return

  if (DEMO_LOCKED.some(rule => (rule.method === '*' || rule.method === method) && rule.path.test(path)))
    throw createError({ statusCode: 403, message: 'Not available in the demo' })
})
