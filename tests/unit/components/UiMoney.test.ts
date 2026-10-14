import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import UiMoney from '../../../app/components/ui/UiMoney.vue'
import { useUiStore } from '../../../app/stores/ui'

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('uiMoney', () => {
  it('показывает сумму со знаком одним текстом', () => {
    expect(mount(UiMoney, { props: { amount: 1500, sign: '+' } }).text()).toMatch(/^\+1\s500 ₽$/)
  })

  it('в скрытом режиме — плашка фиксированной ширины без цифр и знака, ₽ остаётся', () => {
    useUiStore().toggleAmountsHidden()

    const small = mount(UiMoney, { props: { amount: 15, sign: '+' } })
    const big = mount(UiMoney, { props: { amount: 1_500_000, sign: '+' } })

    expect(small.find('[data-testid="money-hidden"]').exists()).toBe(true)
    expect(small.text()).not.toMatch(/\d|\+/)
    expect(small.text()).toContain('₽')
    expect(big.find('[data-testid="money-hidden"]').classes()).toEqual(small.find('[data-testid="money-hidden"]').classes())
  })
})
