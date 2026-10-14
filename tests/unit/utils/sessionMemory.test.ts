import { afterEach, describe, expect, it, vi } from 'vitest'
import { forgetSession, recallSession, rememberSession } from '../../../app/utils/sessionMemory'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('sessionMemory', () => {
  const profile = {
    id: 'user-1',
    name: 'Max',
    email: 'max@example.com',
    settings: { theme: 'dark', accent: 'violet', lang: 'ru', pinEnabled: true }
  } as const

  it('помнит профиль между запусками и забывает по просьбе', () => {
    rememberSession({ ...profile, settings: { ...profile.settings } })

    expect(recallSession()).toEqual(profile)

    forgetSession()

    expect(recallSession()).toBeNull()
  })

  it('битую или чужую запись не принимает за профиль', () => {
    localStorage.setItem('myday:session', '{not json')
    expect(recallSession()).toBeNull()

    localStorage.setItem('myday:session', JSON.stringify({ name: 'Max' }))
    expect(recallSession()).toBeNull()

    localStorage.setItem('myday:session', JSON.stringify({ id: 'user-1', settings: null }))
    expect(recallSession()).toBeNull()
  })

  it('не падает, если хранилище недоступно', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(() => rememberSession({ ...profile, settings: { ...profile.settings } })).not.toThrow()
    expect(recallSession()).toBeNull()
  })
})
