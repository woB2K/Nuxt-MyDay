import { describe, expect, it } from 'vitest'
import { accentNames, accentSwatches, defaultAccent, isAccentName, toAccentName } from '../../../app/utils/accents'

describe('isAccentName', () => {
  it('пропускает известные имена и отсекает остальное', () => {
    expect(isAccentName('teal')).toBe(true)
    expect(isAccentName('Teal')).toBe(false)
    expect(isAccentName('#A78BFA')).toBe(false)
    expect(isAccentName(undefined)).toBe(false)
  })
})

describe('toAccentName', () => {
  it('возвращает имя как есть', () => {
    expect(toAccentName('rose')).toBe('rose')
  })

  it('переводит legacy-hex из AppSettings в имя акцента', () => {
    expect(toAccentName('#A78BFA')).toBe('violet')
    expect(toAccentName('#2dd4bf')).toBe('teal')
    expect(toAccentName('#E11D48')).toBe('rose')
  })

  it('падает в дефолт на мусоре и пустоте', () => {
    expect(toAccentName(null)).toBe(defaultAccent)
    expect(toAccentName('#123456')).toBe(defaultAccent)
    expect(toAccentName(42)).toBe(defaultAccent)
  })
})

describe('accentSwatches', () => {
  it('у каждого акцента есть пара значений для тёмной и светлой темы', () => {
    accentNames.forEach((name) => {
      expect(accentSwatches[name].dark).toMatch(/^#[0-9A-F]{6}$/i)
      expect(accentSwatches[name].light).toMatch(/^#[0-9A-F]{6}$/i)
      expect(accentSwatches[name].dark).not.toBe(accentSwatches[name].light)
    })
  })
})
