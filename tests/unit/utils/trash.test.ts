import type { TrashResponse } from '../../../shared/types'
import { describe, expect, it } from 'vitest'
import { dropFromTrash, emptyTrash, trashDaysLeft, trashSize } from '../../../app/utils/trash'

const DAY_MS = 24 * 60 * 60 * 1000
const now = new Date('2026-10-31T12:00:00.000Z')

function ago(days: number) {
  return new Date(now.getTime() - days * DAY_MS)
}

function cache(): TrashResponse {
  return {
    tasks: [{ id: 'a' }, { id: 'shared' }],
    transactions: [{ id: 'shared' }, { id: 'b' }],
    savings: [{ id: 'shared' }]
  } as unknown as TrashResponse
}

describe('dropFromTrash', () => {
  it('убирает задачу и не трогает финансы с тем же id', () => {
    const next = dropFromTrash(cache(), 'task', 'shared')

    expect(next.tasks.map(el => el.id)).toEqual(['a'])
    expect(next.transactions).toHaveLength(2)
    expect(next.savings).toHaveLength(1)
  })

  it('убирает транзакцию', () => {
    expect(dropFromTrash(cache(), 'transaction', 'b').transactions.map(el => el.id)).toEqual(['shared'])
  })

  it('убирает запись копилки', () => {
    expect(dropFromTrash(cache(), 'savings', 'shared').savings).toEqual([])
  })

  it('не мутирует исходный кэш', () => {
    const original = cache()

    dropFromTrash(original, 'task', 'a')

    expect(original.tasks).toHaveLength(2)
  })
})

describe('emptyTrash / trashSize', () => {
  it('пустая корзина без единого объекта', () => {
    expect(trashSize(emptyTrash())).toBe(0)
  })

  it('считает объекты всех видов', () => {
    expect(trashSize(cache())).toBe(5)
  })

  it('без данных — ноль', () => {
    expect(trashSize(undefined)).toBe(0)
  })
})

describe('trashDaysLeft', () => {
  it('только что удалённое хранится 30 дней', () => {
    expect(trashDaysLeft(now, now)).toBe(30)
  })

  it('считает оставшиеся дни с округлением вверх', () => {
    expect(trashDaysLeft(ago(10), now)).toBe(20)
    expect(trashDaysLeft(ago(10.5), now)).toBe(20)
  })

  it('в последний день показывает 1, а не 0', () => {
    expect(trashDaysLeft(ago(29.9), now)).toBe(1)
  })

  it('просроченное, но ещё не вычищенное не уходит в ноль и минус', () => {
    expect(trashDaysLeft(ago(31), now)).toBe(1)
  })

  it('принимает дату строкой из JSON', () => {
    expect(trashDaysLeft(ago(5).toISOString(), now)).toBe(25)
  })
})
