import { afterEach, describe, expect, it, vi } from 'vitest'
import { isOnline, isTransportError } from '../../../app/utils/network'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('isTransportError', () => {
  it('обрыв сети и таймаут ofetch — это FetchError без статуса', () => {
    expect(isTransportError(Object.assign(new Error('fetch failed'), { name: 'FetchError' }))).toBe(true)
  })

  it('ответ сервера с ошибкой — не обрыв', () => {
    expect(isTransportError(Object.assign(new Error('Bad request'), { name: 'FetchError', statusCode: 400 }))).toBe(false)
  })

  it('ошибка в нашем коде — не обрыв, в очередь её не кладём', () => {
    expect(isTransportError(new TypeError('x is undefined'))).toBe(false)
    expect(isTransportError(null)).toBe(false)
  })
})

describe('isOnline', () => {
  it('верит только navigator.onLine === false', () => {
    expect(isOnline()).toBe(true)

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    expect(isOnline()).toBe(false)
  })
})
