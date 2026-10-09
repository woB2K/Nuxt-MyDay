import { describe, expect, it } from 'vitest'
import { authorOf, inviteTokenOf, joinPath, joinStateOf, nextOwnerOf } from '../../../app/utils/family'

const max = { userId: 'max', name: 'Максим', colorIndex: 0, joinedAt: '2026-10-01' }
const masha = { userId: 'masha', name: 'Маша', colorIndex: 1, joinedAt: '2026-10-03' }
const alexey = { userId: 'alexey', name: 'Алексей', colorIndex: 2, joinedAt: '2026-10-02' }
const misha = { userId: 'misha', name: 'миша', colorIndex: 3, joinedAt: '2026-10-04' }

function preview(state: 'ready' | 'alreadyMember' | 'mustLeave') {
  return { inviterName: 'Максим', members: [], shareSavings: true, state, own: false, mine: { transactionCount: 0, matchingCategories: [], savingsBalance: 0 } }
}

describe('authorOf', () => {
  it('не рисует автора у своих операций и в семье из одного', () => {
    expect(authorOf([max, masha], 'max', 'max')).toBeUndefined()
    expect(authorOf([max], 'max', 'someone')).toBeUndefined()
  })

  it('отдаёт имя и цвет участника', () => {
    expect(authorOf([max, masha, alexey], 'max', 'masha')).toEqual({ name: 'Маша', colorIndex: 1, named: false })
  })

  it('просит имя в строке, когда у двух других участников совпала первая буква', () => {
    expect(authorOf([max, masha, misha], 'max', 'masha')?.named).toBe(true)
  })

  it('не считает совпадением мою собственную букву', () => {
    expect(authorOf([max, masha], 'max', 'masha')?.named).toBe(false)
  })

  it('ушедший автор — нейтральный бейдж без имени', () => {
    expect(authorOf([max, masha], 'max', 'gone')).toEqual({ name: null, colorIndex: null, named: false })
  })
})

describe('nextOwnerOf', () => {
  it('выбирает самого давнего из остальных', () => {
    expect(nextOwnerOf([max, masha, alexey], 'max')?.userId).toBe('alexey')
  })
})

describe('joinStateOf', () => {
  it('переводит state превью в экран вступления', () => {
    expect(joinStateOf(preview('ready'), null)).toBe('ok')
    expect(joinStateOf(preview('mustLeave'), null)).toBe('busy')
    expect(joinStateOf(preview('alreadyMember'), null)).toBe('already')
  })

  it('404 — ссылка больше не работает, другие ошибки — не решение экрана', () => {
    expect(joinStateOf(undefined, { statusCode: 404 })).toBe('invalid')
    expect(joinStateOf(undefined, { statusCode: 500 })).toBeUndefined()
    expect(joinStateOf(undefined, null)).toBeUndefined()
  })
})

describe('joinPath / inviteTokenOf', () => {
  it('туда и обратно сохраняют токен', () => {
    expect(inviteTokenOf(joinPath('abc-_123'))).toBe('abc-_123')
  })

  it('не находит токен в других путях', () => {
    expect(inviteTokenOf('/finance')).toBeUndefined()
    expect(inviteTokenOf('/family/join/')).toBeUndefined()
  })
})
