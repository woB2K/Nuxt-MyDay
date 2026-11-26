import { describe, expect, it } from 'vitest'
import { savingsEntryLook } from '../../../app/utils/savingsLooks'

describe('savingsEntryLook', () => {
  it('рисует сверку вниз со знаком минус и модулем суммы', () => {
    expect(savingsEntryLook({ type: 'ADJUSTMENT', amount: -860000 })).toMatchObject({ sign: '−', amount: 860000, icon: 'i-lucide-scale' })
  })

  it('рисует сверку вверх со знаком плюс', () => {
    expect(savingsEntryLook({ type: 'ADJUSTMENT', amount: 1500 })).toMatchObject({ sign: '+', amount: 1500 })
  })

  it('оставляет знак и сумму остальных записей как есть', () => {
    expect(savingsEntryLook({ type: 'WITHDRAWAL', amount: 200 })).toMatchObject({ sign: '−', amount: 200 })
    expect(savingsEntryLook({ type: 'OPENING', amount: 1000 })).toMatchObject({ sign: '', amount: 1000 })
  })
})
