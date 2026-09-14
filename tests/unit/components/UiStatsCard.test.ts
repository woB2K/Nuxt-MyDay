import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiStatsCard from '../../../app/components/ui/UiStatsCard.vue'

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, count?: number) => count === undefined ? key : `${key}:${count}`
}))

function mountCard(props: Record<string, unknown>) {
  return mount(UiStatsCard, { props, global: { stubs: { UIcon: true } } })
}

function barWidth(wrapper: ReturnType<typeof mountCard>) {
  return wrapper.find('.bg-accent').attributes('style')
}

describe('uiStatsCard', () => {
  it('передаёт число в плюрализацию подписи стрика', () => {
    const wrapper = mountCard({ type: 'streak', value: 3 })

    expect(wrapper.text()).toContain('tasks.stats.streak:3')
  })

  it('рисует прогресс долей от общего числа', () => {
    const wrapper = mountCard({ type: 'progress', value: 3, total: 4 })

    expect(wrapper.text()).toContain('/ 4')
    expect(barWidth(wrapper)).toContain('width: 75%')
  })

  it('не делит на ноль, когда задач нет', () => {
    const wrapper = mountCard({ type: 'progress', value: 0, total: 0 })

    expect(barWidth(wrapper)).toContain('width: 0%')
  })

  it('не выходит за 100% при перевыполнении', () => {
    const wrapper = mountCard({ type: 'progress', value: 7, total: 4 })

    expect(barWidth(wrapper)).toContain('width: 100%')
  })
})
