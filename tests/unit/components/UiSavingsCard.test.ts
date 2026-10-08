import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiSavingsCard from '../../../app/components/ui/UiSavingsCard.vue'

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

function mountCard(props: { balance?: number, delta?: number } = {}) {
  return mount(UiSavingsCard, {
    props: { balance: props.balance ?? 1_245_000, delta: props.delta ?? 0 },
    global: { stubs: { UIcon: true } }
  })
}

describe('uiSavingsCard', () => {
  it('keeps the balance on one line', () => {
    const amount = mountCard().findAll('span').find(span => span.text().endsWith('₽'))

    expect(amount?.classes()).toContain('whitespace-nowrap')
  })

  it('hides the badge and the period caption when there is no delta', () => {
    const text = mountCard().text()

    expect(text).not.toContain('finance.savings.forPeriod')
    expect(text).not.toContain('+')
  })

  it('shows the period caption in the same row as the badge', () => {
    const wrapper = mountCard({ delta: 245_000 })
    const caption = wrapper.findAll('span').find(span => span.text() === 'finance.savings.forPeriod')
    const row = caption?.element.parentElement

    expect(row?.textContent).toContain('+245')
    expect(row?.textContent).not.toContain('finance.savings.balance')
  })

  it('marks a negative delta as danger', () => {
    const badge = mountCard({ delta: -1000 }).findAll('span').find(span => span.text().startsWith('−'))

    expect(badge?.classes()).toContain('text-danger')
  })
})
