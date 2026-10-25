import { describe, expect, it } from 'vitest'
import { currencyAffix, currencyName, decimalSeparator, formatAmount, formatMoney } from '../../../app/utils/formatAmount'

describe('formatAmount', () => {
  it('группирует разряды по языку интерфейса, целые — без копеек', () => {
    expect(formatAmount(1_245_000, 'ru')).toMatch(/^1\s245\s000$/)
    expect(formatAmount(1_245_000, 'en')).toBe('1,245,000')
  })

  it('показывает копейки, только когда они есть', () => {
    expect(formatAmount(1_245_000.6, 'ru')).toMatch(/^1\s245\s000,60$/)
    expect(formatAmount(12.5, 'en')).toBe('12.50')
    expect(formatAmount(0.1 + 0.2, 'en')).toBe('0.30')
    expect(formatAmount(30.000000000004, 'en')).toBe('30')
  })
})

describe('formatMoney', () => {
  it('ставит знак перед суммой, а символ валюты — по правилам языка', () => {
    expect(formatMoney(150, 'RUB', 'ru', '-')).toMatch(/^-150\s₽$/)
    expect(formatMoney(1500, 'USD', 'ru')).toMatch(/^1\s500\s\$$/)
    expect(formatMoney(1500, 'USD', 'en', '+')).toBe('+$1,500')
    expect(formatMoney(1500, 'EUR', 'en')).toBe('€1,500')
  })

  it('копейки — по правилам валюты: у доллара две, у иены нет', () => {
    expect(formatMoney(12.5, 'USD', 'en')).toBe('$12.50')
    expect(formatMoney(149.99, 'RUB', 'ru', '-')).toMatch(/^-149,99\s₽$/)
    expect(formatMoney(1500.5, 'JPY', 'en')).toBe('¥1,501')
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

describe('decimalSeparator', () => {
  it('отдаёт десятичный разделитель языка', () => {
    expect(decimalSeparator('ru')).toBe(',')
    expect(decimalSeparator('en')).toBe('.')
  })
})
