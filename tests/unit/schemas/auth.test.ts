import { describe, expect, it } from 'vitest'
import { loginSchema, oauthCallbackSchema, registerSchema } from '../../../shared/schemas/auth'

describe('registerSchema', () => {
  it('accepts valid input', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'secret123'
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = registerSchema.safeParse({
      name: '',
      email: 'john@example.com',
      password: 'secret123'
    })
    expect(result.success).toBe(false)
  })

  it('rejects name shorter than 2 chars', () => {
    const result = registerSchema.safeParse({
      name: 'J',
      email: 'john@example.com',
      password: 'secret123'
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'not-an-email',
      password: 'secret123'
    })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'short'
    })
    expect(result.success).toBe(false)
  })

  it('rejects password longer than 30 chars', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'a'.repeat(31)
    })
    expect(result.success).toBe(false)
  })

  it('strips extra fields', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'secret123',
      role: 'admin'
    })
    expect(result.success).toBe(true)
    expect((result.data as Record<string, unknown>).role).toBeUndefined()
  })
})

describe('loginSchema', () => {
  it('accepts valid input', () => {
    const result = loginSchema.safeParse({
      email: 'john@example.com',
      password: 'secret123'
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'secret123'
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({
      email: 'john@example.com'
    })
    expect(result.success).toBe(false)
  })
})

describe('oauthCallbackSchema', () => {
  it('accepts code without state', () => {
    const result = oauthCallbackSchema.safeParse({ code: 'abc123' })
    expect(result.success).toBe(true)
  })

  it('accepts code with state', () => {
    const result = oauthCallbackSchema.safeParse({ code: 'abc123', state: 'xyz' })
    expect(result.success).toBe(true)
  })

  it('rejects missing code', () => {
    const result = oauthCallbackSchema.safeParse({ state: 'xyz' })
    expect(result.success).toBe(false)
  })
})
