import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import UiAmountInput from '../../../app/components/ui/UiAmountInput.vue'

const nbsp = ' '

function mountInput(modelValue = '') {
  const wrapper = mount(UiAmountInput, {
    props: {
      'modelValue': modelValue,
      'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value })
    },
    attachTo: document.body
  })
  const input = wrapper.find('input').element as HTMLInputElement

  return { wrapper, input }
}

function type(input: HTMLInputElement, value: string, caret = value.length) {
  input.value = value
  input.setSelectionRange(caret, caret)
  input.dispatchEvent(new Event('input'))
}

describe('uiAmountInput', () => {
  it('делит число на разряды прямо при наборе', async () => {
    const { wrapper, input } = mountInput()

    type(input, '245000')
    await nextTick()

    expect(input.value).toBe(`245${nbsp}000`)
    expect(wrapper.props('modelValue')).toBe('245000')
    wrapper.unmount()
  })

  it('показывает пришедшее значение уже с разрядами', () => {
    const { wrapper, input } = mountInput('1500.5')

    expect(input.value).toBe(`1${nbsp}500,5`)
    wrapper.unmount()
  })

  it('не уводит каретку в конец при правке в середине', async () => {
    const { wrapper, input } = mountInput('245000')

    type(input, `2459${nbsp}000`, 4)
    await nextTick()

    expect(input.value).toBe(`2${nbsp}459${nbsp}000`)
    expect(input.selectionStart).toBe(5)
    wrapper.unmount()
  })

  it('принимает запятую с русской клавиатуры', async () => {
    const { wrapper, input } = mountInput()

    type(input, '99,9')
    await nextTick()

    expect(wrapper.props('modelValue')).toBe('99.9')
    expect(input.value).toBe('99,9')
    wrapper.unmount()
  })

  it('стирает мусор, даже если значение модели не изменилось', async () => {
    const { wrapper, input } = mountInput('5')

    type(input, '5a')
    await nextTick()

    expect(input.value).toBe('5')
    wrapper.unmount()
  })
})
