import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AuthorFilterSheet from '../../../app/components/features/finance/AuthorFilterSheet.vue'

const { family } = vi.hoisted(() => ({
  family: {
    me: { value: { userId: 'me', name: 'Максим', colorIndex: 0 } },
    others: { value: [{ userId: 'anya', name: 'Аня', colorIndex: 1 }, { userId: 'bob', name: 'Боб', colorIndex: 2 }] }
  }
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useFamily', () => () => family)

function mountSheet(selected: string | null = null) {
  return mount(AuthorFilterSheet, {
    props: { open: true, selected },
    global: {
      stubs: {
        UiSheet: { template: '<div><slot /></div>' },
        UiAvatar: true,
        UIcon: true
      }
    }
  })
}

describe('authorFilterSheet', () => {
  it('предлагает «Все», потом свои, потом остальных участников', () => {
    const options = mountSheet().findAll('[data-testid="author-option"]')

    expect(options.map(option => option.text())).toEqual(['family.finance.everyone', 'family.finance.mine', 'Аня', 'Боб'])
  })

  it('выбор применяется сразу и закрывает шторку', async () => {
    const wrapper = mountSheet()

    await wrapper.findAll('[data-testid="author-option"]')[2]!.trigger('click')

    expect(wrapper.emitted('apply')).toEqual([['anya']])
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('«Все» снимает фильтр', async () => {
    const wrapper = mountSheet('anya')

    await wrapper.findAll('[data-testid="author-option"]')[0]!.trigger('click')

    expect(wrapper.emitted('apply')).toEqual([[null]])
  })
})
