import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiDateInput from '../../../app/components/ui/UiDateInput.vue'

function pointer(fine: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ matches: fine && query === '(pointer: fine)' }) as MediaQueryList)
}

function mountInput() {
  const wrapper = mount(UiDateInput, { props: { modelValue: '2026-10-08' } })
  const input = wrapper.find('input').element as HTMLInputElement
  const showPicker = vi.fn()
  input.showPicker = showPicker

  return { wrapper, showPicker }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('uiDateInput', () => {
  it('открывает календарь кликом по всему полю, когда указатель — мышь', async () => {
    pointer(true)
    const { wrapper, showPicker } = mountInput()

    await wrapper.find('input').trigger('click')

    expect(showPicker).toHaveBeenCalledOnce()
  })

  it('на тач-экране оставляет нативное поведение', async () => {
    pointer(false)
    const { wrapper, showPicker } = mountInput()

    await wrapper.find('input').trigger('click')

    expect(showPicker).not.toHaveBeenCalled()
  })

  it('отдаёт выбранный день строкой через v-model', async () => {
    const { wrapper } = mountInput()

    await wrapper.find('input').setValue('2026-10-09')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-10-09'])
  })

  it('пробрасывает классы на input', () => {
    const wrapper = mount(UiDateInput, { attrs: { class: 'h-12 w-full' } })

    expect(wrapper.find('input').classes()).toContain('h-12')
  })
})
