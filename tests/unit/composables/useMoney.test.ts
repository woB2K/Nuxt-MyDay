import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useMoney } from '../../../app/composables/useMoney'
import { useUiStore } from '../../../app/stores/ui'

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, string>) => params ? `${key}:${Object.values(params).join('|')}` : key
}))

beforeEach(() => {
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
})
