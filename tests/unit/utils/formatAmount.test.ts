import { describe, expect, it } from 'vitest'
import { currencyAffix, currencyName, formatAmount, formatMoney } from '../../../app/utils/formatAmount'

describe('formatAmount', () => {
  it('режет копейки и группирует разряды по языку интерфейса', () => {
    expect(formatAmount(1_245_000.6, 'ru')).toMatch(/^1\s245\s001$/)
    expect(formatAmount(1_245_000.6, 'en')).toBe('1,245,001')
  })
})

describe('formatMoney', () => {
  it('ставит знак перед суммой, а символ валюты — по правилам языка', () => {
    expect(formatMoney(150, 'RUB', 'ru', '-')).toMatch(/^-150\s₽$/)
    expect(formatMoney(1500, 'USD', 'ru')).toMatch(/^1\s500\s\$$/)
    expect(formatMoney(1500, 'USD', 'en', '+')).toBe('+$1,500')
    expect(formatMoney(1500, 'EUR', 'en')).toBe('€1,500')
  })
})

describe('currencyAffix', () => {
  it('отдаёт символ с той стороны, где его пишет язык', () => {
    expect(currencyAffix('RUB', 'ru')).toEqual({ prefix: '', suffix: '₽' })
    expect(currencyAffix('USD', 'en')).toEqual({ prefix: '$', suffix: '' })
  })
})

describe('currencyName', () => {
  it('называет валюту на языке интерфейса', () => {
    expect(currencyName('EUR', 'en')).toBe('Euro')
    expect(currencyName('USD', 'ru')).toBe('доллар США')
  })
})
