import { createHash } from 'node:crypto'
import { jwtVerify, SignJWT } from 'jose'

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function signAccessToken(userId: string): Promise<string> {
  const config = useRuntimeConfig()

  const jwt = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(new TextEncoder().encode(config.jwtAccessSecret))

  return jwt
}

export async function signRefreshToken(userId: string): Promise<string> {
  const config = useRuntimeConfig()

  const jwt = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(new TextEncoder().encode(config.jwtRefreshSecret))

  return jwt
}

export async function verifyAccessToken(token: string): Promise<string> {
  const config = useRuntimeConfig()

  const { payload } = await jwtVerify(token, new TextEncoder().encode(config.jwtAccessSecret))

  if (!payload.sub) throw createError({ statusCode: 401, message: 'Invalid token' })
  return payload.sub
}

export async function verifyRefreshToken(token: string): Promise<string> {
  const config = useRuntimeConfig()

  const { payload } = await jwtVerify(token, new TextEncoder().encode(config.jwtRefreshSecret))

  if (!payload.sub) throw createError({ statusCode: 401, message: 'Invalid token' })
  return payload.sub
}
