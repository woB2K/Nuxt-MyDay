import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import AccentPicker from '../../../app/components/features/settings/AccentPicker.vue'
import { accentNames, accentSwatches } from '../../../app/utils/accents'

const { theme } = vi.hoisted(() => ({
  theme: { accent: 'violet', resolved: 'dark' }
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useTheme', () => () => ({
  accent: computed(() => theme.accent),
  resolved: computed(() => theme.resolved)
}))

function mountPicker() {
  return mount(AccentPicker, { global: { stubs: { UIcon: true } } })
}

describe('accentPicker', () => {
  it('рисует по кружку на каждый акцент', () => {
    expect(mountPicker().findAll('button')).toHaveLength(accentNames.length)
  })

  it('красит кружки значениями текущей темы, а не фиксированными', () => {
    theme.resolved = 'light'
    const light = mountPicker().findAll('button')[1]!.attributes('style')

    theme.resolved = 'dark'
    const dark = mountPicker().findAll('button')[1]!.attributes('style')

    expect(light).toContain(accentSwatches.teal.light)
    expect(dark).toContain(accentSwatches.teal.dark)
  })

  it('помечает выбранный акцент, а не первый попавшийся', () => {
    theme.accent = 'rose'
    const buttons = mountPicker().findAll('button')

    expect(buttons[4]!.attributes('aria-pressed')).toBe('true')
    expect(buttons[0]!.attributes('aria-pressed')).toBe('false')
  })

  it('не меняет тему сам, а отдаёт выбор наружу', async () => {
    const wrapper = mountPicker()

    await wrapper.findAll('button')[1]!.trigger('click')

    expect(wrapper.emitted('select')).toEqual([['teal']])
  })
})
