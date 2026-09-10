import { describe, expect, it } from 'vitest'
import { russianPlural } from '../../../i18n/pluralRules'

// 0 → «операция», 1 → «операции», 2 → «операций»
describe('russianPlural', () => {
  it('единственное число для 1, 21, 101', () => {
    expect(russianPlural(1)).toBe(0)
    expect(russianPlural(21)).toBe(0)
    expect(russianPlural(101)).toBe(0)
  })

  it('форма 2–4 для 2, 33, 104', () => {
    expect(russianPlural(2)).toBe(1)
    expect(russianPlural(33)).toBe(1)
    expect(russianPlural(104)).toBe(1)
  })

  it('форма множества для 0, 5, 11–14, 111', () => {
    expect(russianPlural(0)).toBe(2)
    expect(russianPlural(5)).toBe(2)
    expect(russianPlural(11)).toBe(2)
    expect(russianPlural(14)).toBe(2)
    expect(russianPlural(111)).toBe(2)
  })
})
