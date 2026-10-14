import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { amountsHiddenStorageKey, readAmountsHidden, writeAmountsHidden } from '../../../app/utils/privacy'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('privacy mode в localStorage', () => {
  it('по умолчанию суммы видны', () => {
    expect(readAmountsHidden()).toBe(false)
  })

  it('запоминает выбор и читает его обратно', () => {
    writeAmountsHidden(true)
    expect(localStorage.getItem(amountsHiddenStorageKey)).toBe('1')
    expect(readAmountsHidden()).toBe(true)

    writeAmountsHidden(false)
    expect(readAmountsHidden()).toBe(false)
  })

  it('мусор в ключе не включает режим', () => {
    localStorage.setItem(amountsHiddenStorageKey, 'yes')

    expect(readAmountsHidden()).toBe(false)
  })

  it('недоступный storage не ломает ни чтение, ни запись', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })

    expect(readAmountsHidden()).toBe(false)
    expect(() => writeAmountsHidden(true)).not.toThrow()
  })
})
