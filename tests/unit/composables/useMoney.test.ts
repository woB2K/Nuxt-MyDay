import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMoney } from '../../../app/composables/useMoney'
import { useAuthStore } from '../../../app/stores/auth'
import { useUiStore } from '../../../app/stores/ui'

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }))

mockNuxtImport('useApi', () => () => apiMock)

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, string>) => params ? `${key}:${Object.values(params).join('|')}` : key
}))

beforeEach(() => {
  apiMock.mockReset()
  apiMock.mockResolvedValue({})
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('useMoney', () => {
  it('подпись переключателя называет сумму, пока режим выключен', () => {
    expect(useMoney().toggleLabel(150, '−')).toBe('finance.privacy.toggle:−150 ₽')
  })

  it('в скрытом режиме подпись не выдаёт сумму', () => {
    const { toggleHidden, toggleLabel } = useMoney()

    toggleHidden()

    expect(toggleLabel(150, '−')).toBe('finance.privacy.show')
  })

  it('переключает флаг и сообщает об этом тостом', () => {
    const { hidden, toggleHidden } = useMoney()
    const ui = useUiStore()

    toggleHidden()

    expect(hidden.value).toBe(true)
    expect(ui.queue.at(-1)).toMatchObject({ type: 'info', message: 'toast.privacy.hidden' })

    toggleHidden()

    expect(hidden.value).toBe(false)
    expect(ui.queue.at(-1)?.message).toBe('toast.privacy.visible')
  })

  it('сохраняет скрытие сумм в аккаунт, чтобы пуши тоже шли без сумм', () => {
    const auth = useAuthStore()
    auth.user = { id: 'u1', name: 'Max', email: null, settings: { hideAmounts: false } as never }

    useMoney().toggleHidden()

    expect(auth.user.settings.hideAmounts).toBe(true)
    expect(apiMock).toHaveBeenCalledWith('/api/settings', { method: 'PATCH', body: { hideAmounts: true } })
  })

  it('без входа ничего не отправляет на сервер', () => {
    useMoney().toggleHidden()

    expect(apiMock).not.toHaveBeenCalled()
  })
})
