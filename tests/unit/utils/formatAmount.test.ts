import { describe, expect, it } from 'vitest'
import { formatAmount, formatMoney } from '../../../app/utils/formatAmount'

describe('formatAmount', () => {
  it('режет копейки и группирует разряды', () => {
    expect(formatAmount(1_245_000.6)).toMatch(/^1\s245\s001$/)
  })
})

describe('formatMoney', () => {
  it('добавляет знак перед суммой и ₽ после', () => {
    expect(formatMoney(150, '-')).toBe('-150 ₽')
    expect(formatMoney(150)).toBe('150 ₽')
  })
})
