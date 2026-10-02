import { describe, expect, it } from 'vitest'
import { categoryLabel } from '../../../app/utils/categoryLabel'

const dictionary: Record<string, string> = {
  'categories.food': 'Еда и напитки',
  'categories.other-expense': 'Другое'
}

const t = (key: string) => dictionary[key] ?? key

describe('categoryLabel', () => {
  it('переводит сидовую категорию по ключу, а не по имени из БД', () => {
    expect(categoryLabel({ name: 'Food & Drink', key: 'food' }, t)).toBe('Еда и напитки')
  })

  it('показывает имя пользователя, когда ключа нет', () => {
    expect(categoryLabel({ name: 'Кофе', key: null }, t)).toBe('Кофе')
    expect(categoryLabel({ name: 'Кофе' }, t)).toBe('Кофе')
  })

  it('откатывается на имя, если перевода под ключ не завезли', () => {
    expect(categoryLabel({ name: 'Housing', key: 'housing' }, t)).toBe('Housing')
  })

  it('различает «Другое» расходов и доходов по ключу', () => {
    expect(categoryLabel({ name: 'Other', key: 'other-expense' }, t)).toBe('Другое')
    expect(categoryLabel({ name: 'Other', key: 'other-income' }, t)).toBe('Other')
  })
})
