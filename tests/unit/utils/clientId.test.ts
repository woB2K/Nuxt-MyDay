import { afterEach, describe, expect, it, vi } from 'vitest'
import { newClientId } from '../../../app/utils/clientId'
import { clientIdSchema } from '../../../shared/schemas/finance'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('newClientId', () => {
  it('проходит серверную схему id и не повторяется', () => {
    const ids = Array.from({ length: 100 }, newClientId)

    ids.forEach(id => expect(clientIdSchema.safeParse(id).success).toBe(true))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('обходится без crypto.randomUUID — на http://<LAN-IP> его нет', () => {
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      throw new TypeError('crypto.randomUUID is not a function')
    })

    expect(() => newClientId()).not.toThrow()
  })
})
