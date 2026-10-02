import { describe, expect, it } from 'vitest'
import { comparePassword, hashPassword } from '../../../server/utils/password'

describe('hashPassword / comparePassword', () => {
  it('hash is not the same as the original password', async () => {
    const hash = await hashPassword('mypassword123')
    expect(hash).not.toBe('mypassword123')
  })

  it('correct password matches its hash', async () => {
    const password = 'correct-horse-battery-staple'
    const hash = await hashPassword(password)
    const match = await comparePassword(password, hash)
    expect(match).toBe(true)
  })

  it('wrong password does not match the hash', async () => {
    const hash = await hashPassword('correct-password')
    const match = await comparePassword('wrong-password', hash)
    expect(match).toBe(false)
  })

  it('two hashes of the same password differ (random salt)', async () => {
    const password = 'same-password'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)
    expect(hash1).not.toBe(hash2)
  })

  it('empty string does not match a hash of a real password', async () => {
    const hash = await hashPassword('realpassword')
    const match = await comparePassword('', hash)
    expect(match).toBe(false)
  })
})
