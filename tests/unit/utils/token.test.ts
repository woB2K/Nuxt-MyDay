import { Buffer } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import { tokenSubject } from '../../../app/utils/token'

const jwt = (payload: object) => `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`

describe('tokenSubject', () => {
  it('достаёт sub из access-токена', () => {
    expect(tokenSubject(jwt({ sub: 'user-2', exp: 1 }))).toBe('user-2')
  })

  it('молчит на пустом, непрозрачном и битом токене', () => {
    expect(tokenSubject(null)).toBeUndefined()
    expect(tokenSubject('opaque-token')).toBeUndefined()
    expect(tokenSubject('header.%%%.signature')).toBeUndefined()
    expect(tokenSubject(jwt({ sub: 42 }))).toBeUndefined()
  })
})
