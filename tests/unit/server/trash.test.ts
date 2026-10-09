import { describe, expect, it } from 'vitest'
import { inTrash, trashCutoff } from '../../../server/utils/trash'

const now = new Date('2026-10-31T12:00:00.000Z')

describe('trashCutoff', () => {
  it('отстоит ровно на 30 суток назад', () => {
    expect(trashCutoff(now).toISOString()).toBe('2026-10-01T12:00:00.000Z')
  })

  it('по умолчанию считает от текущего момента', () => {
    const before = Date.now()
    const cutoff = trashCutoff().getTime()

    expect(before - cutoff).toBeGreaterThanOrEqual(30 * 24 * 60 * 60 * 1000 - 50)
    expect(before - cutoff).toBeLessThanOrEqual(30 * 24 * 60 * 60 * 1000 + 50)
  })
})

describe('inTrash', () => {
  it('пускает только удалённое не раньше границы хранения', () => {
    expect(inTrash(now)).toEqual({ gte: new Date('2026-10-01T12:00:00.000Z') })
  })
})
