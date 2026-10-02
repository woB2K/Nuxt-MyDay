import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from '../../../app/composables/useTheme'
import { useUiStore } from '../../../app/stores/ui'
import { accentSwatches } from '../../../app/utils/accents'

const { colorMode } = vi.hoisted(() => ({
  colorMode: { preference: 'system', value: 'dark' }
}))

mockNuxtImport('useColorMode', () => () => colorMode)

beforeEach(() => {
  setActivePinia(createPinia())
  colorMode.preference = 'system'
  colorMode.value = 'dark'
})

describe('preference', () => {
  it('отдаёт выбор пользователя из color-mode', () => {
    colorMode.preference = 'light'

    expect(useTheme().preference.value).toBe('light')
  })

  it('чинит неизвестное значение в system, не роняя приложение', () => {
    colorMode.preference = 'sepia'

    expect(useTheme().preference.value).toBe('system')
  })

  it('setTheme пишет обратно в color-mode, который сам ставит класс на html', () => {
    useTheme().setTheme('dark')

    expect(colorMode.preference).toBe('dark')
  })
})

describe('resolved', () => {
  it('различает реально применённую тему, а не выбор пользователя', () => {
    colorMode.preference = 'system'
    colorMode.value = 'light'

    const { preference, resolved, surfaceColor } = useTheme()

    expect(preference.value).toBe('system')
    expect(resolved.value).toBe('light')
    expect(surfaceColor.value).toBe('#F4F4F8')
  })
})

describe('accent', () => {
  it('берёт затемнённый под WCAG вариант на светлой теме', () => {
    useUiStore().accent = 'teal'
    colorMode.value = 'light'

    expect(useTheme().accentColor.value).toBe(accentSwatches.teal.light)
  })

  it('на тёмной теме берёт светлый вариант того же акцента', () => {
    useUiStore().accent = 'teal'

    expect(useTheme().accentColor.value).toBe(accentSwatches.teal.dark)
  })

  it('setAccent складывает выбор в стор, откуда его читает data-accent', () => {
    useTheme().setAccent('rose')

    expect(useUiStore().accent).toBe('rose')
  })
})
