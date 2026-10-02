import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import TagPicker from '../../../app/components/features/tasks/TagPicker.vue'
import UiChip from '../../../app/components/ui/UiChip.vue'

const { tagMutate } = vi.hoisted(() => ({ tagMutate: vi.fn() }))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useAppToast', () => () => ({ success: () => {}, error: () => {}, info: () => {} }))
mockNuxtImport('useTagsQuery', () => () => ({
  data: ref([{ id: 'tag-1', name: 'дом' }, { id: 'tag-2', name: 'работа' }])
}))
mockNuxtImport('useAddTagMutation', () => () => ({ mutate: tagMutate, isPending: ref(false) }))

function mountPicker(modelValue: string[] = []) {
  return mount(TagPicker, {
    props: { modelValue },
    global: {
      components: { UiChip },
      stubs: {
        UiRoundBtn: { name: 'UiRoundBtn', template: '<button type="button"><slot /></button>' },
        UIcon: true
      }
    }
  })
}

beforeEach(() => {
  tagMutate.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('tagPicker', () => {
  it('добавляет и снимает тег по тапу', async () => {
    const wrapper = mountPicker()

    await wrapper.findAllComponents(UiChip)[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['tag-1']]])

    await wrapper.setProps({ modelValue: ['tag-1'] })
    await wrapper.findAllComponents(UiChip)[0]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[]])
  })

  it('не создаёт тег из пустой строки', async () => {
    const wrapper = mountPicker()

    await wrapper.findComponent({ name: 'UiRoundBtn' }).trigger('click')

    expect(tagMutate).not.toHaveBeenCalled()
  })

  it('новый тег сразу попадает в выбранные', async () => {
    tagMutate.mockImplementation((_body, options) => options.onSuccess({ id: 'tag-3', name: 'спорт' }))
    const wrapper = mountPicker(['tag-1'])

    await wrapper.find('input').setValue('  спорт  ')
    await wrapper.findComponent({ name: 'UiRoundBtn' }).trigger('click')

    expect(tagMutate.mock.calls[0]![0]).toEqual({ name: 'спорт' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[['tag-1', 'tag-3']]])
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })
})
