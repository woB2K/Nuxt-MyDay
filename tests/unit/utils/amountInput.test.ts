import { describe, expect, it } from 'vitest'
import { caretAfterAmountChars, countAmountChars, formatAmountInput, parseAmountInput } from '../../../app/utils/amountInput'

const nbsp = ' '

describe('parseAmountInput', () => {
  it('выкидывает разделители разрядов и мусор', () => {
    expect(parseAmountInput(`245${nbsp}000`)).toBe('245000')
    expect(parseAmountInput('1 2a3')).toBe('123')
  })

  it('принимает и запятую, и точку как десятичный разделитель', () => {
    expect(parseAmountInput('12,5')).toBe('12.5')
    expect(parseAmountInput('12.5')).toBe('12.5')
  })

  it('оставляет один разделитель и не больше двух знаков после него', () => {
    expect(parseAmountInput('1,2,3')).toBe('1.23')
    expect(parseAmountInput('1,999')).toBe('1.99')
  })

  it('сохраняет разделитель в конце, пока пользователь набирает копейки', () => {
    expect(parseAmountInput('100,')).toBe('100.')
  })

  it('срезает ведущие нули, но не единственный', () => {
    expect(parseAmountInput('0005')).toBe('5')
    expect(parseAmountInput('0')).toBe('0')
    expect(parseAmountInput(',5')).toBe('0.5')
  })

  it('пустая строка остаётся пустой', () => {
    expect(parseAmountInput('')).toBe('')
  })
})

describe('formatAmountInput', () => {
  it('делит целую часть на разряды неразрывным пробелом', () => {
    expect(formatAmountInput('245000')).toBe(`245${nbsp}000`)
    expect(formatAmountInput('1234567')).toBe(`1${nbsp}234${nbsp}567`)
    expect(formatAmountInput('999')).toBe('999')
  })

  it('показывает дробную часть через запятую', () => {
    expect(formatAmountInput('1500.5')).toBe(`1${nbsp}500,5`)
    expect(formatAmountInput('100.')).toBe('100,')
  })

  it('туда-обратно не теряет значение', () => {
    expect(parseAmountInput(formatAmountInput('1234567.89'))).toBe('1234567.89')
  })
})

describe('каретка', () => {
  it('встаёт после того же числа цифр, сколько было перед ней', () => {
    const typed = '24500'
    const formatted = formatAmountInput(parseAmountInput(`${typed}0`))

    expect(caretAfterAmountChars(formatted, countAmountChars(`${typed}0`))).toBe(formatted.length)
    expect(caretAfterAmountChars(formatted, 3)).toBe(3)
    expect(caretAfterAmountChars(formatted, 4)).toBe(5)
  })

  it('в начале поля остаётся в начале', () => {
    expect(caretAfterAmountChars(`1${nbsp}000`, 0)).toBe(0)
  })
})
