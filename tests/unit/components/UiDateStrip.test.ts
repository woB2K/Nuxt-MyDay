import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import UiDateStrip from '../../../app/components/ui/UiDateStrip.vue'

mockNuxtImport('useI18n', () => () => ({ locale: ref('ru') }))

function mountStrip(modelValue = '') {
  return mount(UiDateStrip, { props: { modelValue } })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 8, 14, 23, 40))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('uiDateStrip', () => {
  it('рисует неделю начиная с сегодня', () => {
    const wrapper = mountStrip()
    const days = wrapper.findAll('button')

    expect(days).toHaveLength(7)
    expect(days[0]!.text()).toContain('14')
    expect(days[6]!.text()).toContain('20')
  })

  it('отдаёт календарный день строкой, а не UTC-мгновением', async () => {
    const wrapper = mountStrip()

    await wrapper.findAll('button')[0]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-09-14']])
  })

  it('повторный тап по выбранному дню снимает дату', async () => {
    const wrapper = mountStrip('2026-09-14')

    await wrapper.findAll('button')[0]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
  })

  it('переходит через границу месяца', () => {
    vi.setSystemTime(new Date(2026, 8, 29, 10, 0))
    const wrapper = mountStrip()

    const numbers = wrapper.findAll('button').map(day => day.text().replace(/\D/g, ''))

    expect(numbers).toEqual(['29', '30', '1', '2', '3', '4', '5'])
  })
})
