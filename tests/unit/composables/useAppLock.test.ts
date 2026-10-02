import type { UserProfile } from '../../../shared/types'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { idleLimit, useAppLock } from '../../../app/composables/useAppLock'
import { useAuthStore } from '../../../app/stores/auth'
import { useUiStore } from '../../../app/stores/ui'

let visibility: DocumentVisibilityState = 'visible'
let wrapper: ReturnType<typeof mount> | null = null

function profile(pinEnabled: boolean): UserProfile {
  return {
    id: 'user-1',
    name: 'Max',
    email: 'max@example.com',
    settings: { theme: 'dark', accent: 'violet', lang: 'ru', pinEnabled }
  }
}

function startLock() {
  let lock!: ReturnType<typeof useAppLock>

  wrapper = mount({
    setup() {
      lock = useAppLock()
      lock.start()

      return () => h('div')
    }
  })

  return lock
}

function hide(state: DocumentVisibilityState) {
  visibility = state
  document.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
  visibility = 'visible'
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility)
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useAppLock', () => {
  it('блокирует сразу, если профиль приехал с включённым PIN', async () => {
    const auth = useAuthStore()
    auth.user = profile(true)

    startLock()
    await nextTick()

    expect(useUiStore().isLocked).toBe(true)
  })

  it('не блокирует, пока PIN выключен, сколько бы ни бездействовали', async () => {
    const auth = useAuthStore()
    auth.user = profile(false)

    startLock()
    await nextTick()
    vi.advanceTimersByTime(idleLimit * 3)

    expect(useUiStore().isLocked).toBe(false)
  })

  it('не выкидывает на замок в момент включения PIN — пользователь стоит рядом', async () => {
    const auth = useAuthStore()
    auth.user = profile(false)

    startLock()
    await nextTick()

    auth.user = profile(true)
    await nextTick()

    expect(useUiStore().isLocked).toBe(false)
  })

  it('блокирует после пяти минут бездействия', async () => {
    const auth = useAuthStore()
    auth.user = profile(false)

    startLock()
    await nextTick()

    auth.user = profile(true)
    await nextTick()

    vi.advanceTimersByTime(idleLimit - 1000)
    expect(useUiStore().isLocked).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(useUiStore().isLocked).toBe(true)
  })

  it('любое действие пользователя сдвигает таймер', async () => {
    const auth = useAuthStore()
    auth.user = profile(false)

    startLock()
    await nextTick()

    auth.user = profile(true)
    await nextTick()

    vi.advanceTimersByTime(idleLimit - 1000)
    document.dispatchEvent(new Event('pointerdown'))
    vi.advanceTimersByTime(idleLimit - 1000)

    expect(useUiStore().isLocked).toBe(false)
  })

  it('блокирует при возврате, если в фоне провели больше лимита', async () => {
    const auth = useAuthStore()
    auth.user = profile(false)

    startLock()
    await nextTick()

    auth.user = profile(true)
    await nextTick()

    hide('hidden')
    vi.advanceTimersByTime(idleLimit + 1000)
    hide('visible')

    expect(useUiStore().isLocked).toBe(true)
  })

  it('не блокирует при коротком уходе в фон', async () => {
    const auth = useAuthStore()
    auth.user = profile(false)

    startLock()
    await nextTick()

    auth.user = profile(true)
    await nextTick()

    hide('hidden')
    vi.advanceTimersByTime(30_000)
    hide('visible')

    expect(useUiStore().isLocked).toBe(false)
  })

  it('снимает замок, когда PIN выключили', async () => {
    const auth = useAuthStore()
    auth.user = profile(true)

    startLock()
    await nextTick()
    expect(useUiStore().isLocked).toBe(true)

    auth.user = profile(false)
    await nextTick()

    expect(useUiStore().isLocked).toBe(false)
  })

  it('снимает замок при выходе из аккаунта', async () => {
    const auth = useAuthStore()
    auth.accessToken = 'token'
    auth.user = profile(true)

    startLock()
    await nextTick()
    expect(useUiStore().isLocked).toBe(true)

    auth.accessToken = null
    await nextTick()

    expect(useUiStore().isLocked).toBe(false)
  })

  it('unlock снимает замок и заново заводит таймер бездействия', async () => {
    const auth = useAuthStore()
    auth.user = profile(true)

    const lock = startLock()
    await nextTick()

    lock.unlock()
    expect(useUiStore().isLocked).toBe(false)

    vi.advanceTimersByTime(idleLimit)
    expect(useUiStore().isLocked).toBe(true)
  })
})
