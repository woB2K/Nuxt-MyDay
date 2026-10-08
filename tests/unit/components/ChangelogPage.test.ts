import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import ChangelogPage from '../../../app/pages/settings/changelog.vue'
import pkg from '../../../package.json'
import { changelog } from '../../../shared/changelog'

const { locale } = vi.hoisted(() => ({ locale: { value: 'ru' } }))

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, string>) => params ? `${key} ${Object.values(params).join(' ')}` : key,
  locale: ref(locale.value)
}))

function mountPage(lang: 'en' | 'ru') {
  locale.value = lang

  return mount(ChangelogPage, {
    global: {
      stubs: {
        UIcon: true,
        UiRoundBtn: true,
        UiCard: { template: '<div><slot /></div>' }
      }
    }
  })
}

describe('экран «Что нового»', () => {
  it('показывает текущую версию и все релизы', () => {
    const wrapper = mountPage('en')

    expect(wrapper.text()).toContain(`settings.changelog.current ${pkg.version}`)
    expect(wrapper.findAll('[data-testid="release"]')).toHaveLength(changelog.length)
  })

  it('берёт тексты на языке интерфейса', () => {
    const first = changelog[0]!
    const change = first.changes[0]!

    expect(mountPage('ru').text()).toContain(change.text.ru)
    expect(mountPage('en').text()).toContain(change.text.en)
  })

  it('подписывает тип изменения через i18n', () => {
    const type = changelog[0]!.changes[0]!.type

    expect(mountPage('en').text()).toContain(`settings.changelog.types.${type}`)
  })
})
