import { describe, expect, it } from 'vitest'
import { statusOf } from '../../../app/utils/httpStatus'

describe('statusOf', () => {
  it('берёт statusCode из ошибки ofetch', () => {
    expect(statusOf({ statusCode: 409 })).toBe(409)
  })

  it('падает обратно на status', () => {
    expect(statusOf({ status: 401 })).toBe(401)
  })

  it('для ошибки без статуса и для не-объектов отдаёт undefined', () => {
    expect(statusOf(new Error('network'))).toBeUndefined()
    expect(statusOf(null)).toBeUndefined()
    expect(statusOf('boom')).toBeUndefined()
  })
})
