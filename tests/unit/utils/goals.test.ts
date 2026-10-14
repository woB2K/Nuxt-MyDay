import { describe, expect, it } from 'vitest'
import { goalProgress, monthsLeft } from '../../../app/utils/goals'

const TODAY = '2026-10-14'

describe('monthsLeft', () => {
  it('считает календарные месяцы, включая текущий', () => {
    expect(monthsLeft('2026-12-31', TODAY)).toBe(3)
    expect(monthsLeft('2027-01-01', TODAY)).toBe(4)
  })

  it('дедлайн в этом месяце — один месяц, а не ноль', () => {
    expect(monthsLeft('2026-10-20', TODAY)).toBe(1)
  })
})

describe('goalProgress', () => {
  it('делит остаток на месяцы до дедлайна и округляет вверх', () => {
    expect(goalProgress({ target: 10000, saved: 1000, deadline: '2026-12-31' }, TODAY))
      .toMatchObject({ remaining: 9000, monthly: 3000, reached: false, overdue: false, percent: 10 })
    expect(goalProgress({ target: 1000, saved: 0, deadline: '2026-12-31' }, TODAY).monthly).toBe(334)
  })

  it('принимает дедлайн timestamp-строкой из API', () => {
    expect(goalProgress({ target: 3000, saved: 0, deadline: '2026-12-01T00:00:00.000Z' }, TODAY).monthly).toBe(1000)
  })

  it('без дедлайна не считает сумму в месяц', () => {
    expect(goalProgress({ target: 1000, saved: 100, deadline: null }, TODAY).monthly).toBeNull()
  })

  it('достигнутая цель — 100%, без остатка и без суммы в месяц, даже с перебором', () => {
    expect(goalProgress({ target: 1000, saved: 1200, deadline: '2026-12-31' }, TODAY))
      .toMatchObject({ percent: 100, remaining: 0, reached: true, monthly: null })
  })

  it('просроченная недостигнутая цель — без суммы в месяц', () => {
    expect(goalProgress({ target: 1000, saved: 100, deadline: '2026-10-01' }, TODAY))
      .toMatchObject({ overdue: true, monthly: null })
  })

  it('снятия ниже нуля не уводят прогресс в минус', () => {
    expect(goalProgress({ target: 1000, saved: -200, deadline: null }, TODAY).percent).toBe(0)
  })
})
