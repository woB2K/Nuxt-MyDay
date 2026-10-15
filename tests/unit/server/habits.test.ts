import { describe, expect, it } from 'vitest'
import { assertMarkWindow, toHabitItem } from '../../../server/utils/habits'

const now = new Date('2026-10-15T12:00:00.000Z')

describe('assertMarkWindow', () => {
  it('пускает сегодня и шесть дней назад', () => {
    expect(() => assertMarkWindow('2026-10-15', '2026-10-15', now)).not.toThrow()
    expect(() => assertMarkWindow('2026-10-09', '2026-10-15', now)).not.toThrow()
  })

  it('семь дней назад — уже за окном', () => {
    expect(() => assertMarkWindow('2026-10-08', '2026-10-15', now)).toThrow(expect.objectContaining({ statusCode: 400 }))
  })

  it('будущий день отметить нельзя', () => {
    expect(() => assertMarkWindow('2026-10-16', '2026-10-15', now)).toThrow(expect.objectContaining({ statusCode: 400 }))
  })

  it('«сегодня» клиента может отличаться от UTC-дня сервера на сутки — это таймзона', () => {
    expect(() => assertMarkWindow('2026-10-16', '2026-10-16', now)).not.toThrow()
    expect(() => assertMarkWindow('2026-10-14', '2026-10-14', now)).not.toThrow()
  })

  it('«сегодня» дальше суток от сервера — подмена, а не таймзона', () => {
    expect(() => assertMarkWindow('2026-10-17', '2026-10-17', now)).toThrow(expect.objectContaining({ statusCode: 400 }))
    expect(() => assertMarkWindow('2026-10-01', '2026-10-01', now)).toThrow(expect.objectContaining({ statusCode: 400 }))
  })
})

describe('toHabitItem', () => {
  it('отдаёт отметки календарными днями', () => {
    const item = toHabitItem({
      id: 'h-1',
      userId: 'u-1',
      name: 'Медитация',
      icon: 'leaf',
      color: 'green',
      perWeek: null,
      sortOrder: 0,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      marks: [{ date: new Date('2026-10-14T00:00:00.000Z') }, { date: new Date('2026-10-15T00:00:00.000Z') }]
    })

    expect(item.marks).toEqual(['2026-10-14', '2026-10-15'])
  })
})
