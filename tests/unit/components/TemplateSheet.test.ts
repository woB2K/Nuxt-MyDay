import type { TemplateItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import TemplateSheet from '../../../app/components/features/tasks/TemplateSheet.vue'

const { addMutate, updateMutate, deleteMutate, addTaskMutate, toastError } = vi.hoisted(() => ({
  addMutate: vi.fn(),
  updateMutate: vi.fn(),
  deleteMutate: vi.fn(),
  addTaskMutate: vi.fn(),
  toastError: vi.fn()
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useAppToast', () => () => ({ success: () => {}, error: toastError, info: () => {} }))
mockNuxtImport('useAddTemplateMutation', () => () => ({ mutate: addMutate, isPending: ref(false) }))
mockNuxtImport('useUpdateTemplateMutation', () => () => ({ mutate: updateMutate, isPending: ref(false) }))
mockNuxtImport('useDeleteTemplateMutation', () => () => ({ mutate: deleteMutate, isPending: ref(false) }))
mockNuxtImport('useAddTaskMutation', () => () => ({ mutate: addTaskMutate, isPending: ref(false) }))

const existing: TemplateItem = {
  id: 'tpl-1',
  userId: 'user-1',
  title: 'Утренняя рутина',
  notes: 'зарядка и душ',
  priority: 'MEDIUM',
  createdAt: new Date('2026-09-14T09:00:00.000Z'),
  updatedAt: new Date('2026-09-14T09:00:00.000Z'),
  tags: [{
    id: 'tag-1',
    userId: 'user-1',
    name: 'дом',
    color: null,
    createdAt: new Date('2026-09-14T09:00:00.000Z'),
    updatedAt: new Date('2026-09-14T09:00:00.000Z')
  }]
}

function mountSheet(template: TemplateItem | null = null) {
  return mount(TemplateSheet, {
    props: { open: true, template },
    global: {
      stubs: {
        UiSheet: { template: '<div><slot /></div>' },
        UiPillSelect: true,
        TagPicker: true,
        UiInput: true,
        UiButton: {
          name: 'UiButton',
          props: ['type'],
          template: '<button :type="type ?? \'submit\'"><slot /></button>'
        },
        UIcon: true
      }
    }
  })
}

beforeEach(() => {
  addMutate.mockReset()
  updateMutate.mockReset()
  deleteMutate.mockReset()
  addTaskMutate.mockReset()
  toastError.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('templateSheet', () => {
  it('создаёт шаблон из формы', async () => {
    const wrapper = mountSheet()
    await wrapper.findAllComponents({ name: 'UiInput' })[0]!.setValue('Уборка')

    await wrapper.find('form').trigger('submit')

    expect(addMutate.mock.calls[0]![0]).toEqual({
      title: 'Уборка',
      notes: '',
      priority: 'NONE',
      tagIds: []
    })
  })

  it('заполняется из шаблона и сохраняет правку', async () => {
    const wrapper = mountSheet(existing)

    await wrapper.find('form').trigger('submit')

    expect(updateMutate.mock.calls[0]![0]).toMatchObject({
      id: 'tpl-1',
      title: 'Утренняя рутина',
      notes: 'зарядка и душ',
      priority: 'MEDIUM',
      tagIds: ['tag-1']
    })
  })

  it('«Применить» создаёт задачу, а не шаблон', async () => {
    const wrapper = mountSheet(existing)

    await wrapper.findAllComponents({ name: 'UiButton' })[1]!.trigger('click')

    expect(addTaskMutate.mock.calls[0]![0]).toMatchObject({
      title: 'Утренняя рутина',
      priority: 'MEDIUM',
      tagIds: ['tag-1']
    })
    expect(addMutate).not.toHaveBeenCalled()
    expect(updateMutate).not.toHaveBeenCalled()
  })

  it('не даёт сохранить шаблон без названия', async () => {
    const wrapper = mountSheet()

    await wrapper.find('form').trigger('submit')

    expect(addMutate).not.toHaveBeenCalled()
    expect(toastError).toHaveBeenCalledTimes(1)
  })

  it('кнопки «Применить» и «Удалить» есть только в режиме правки', async () => {
    expect(mountSheet().findAllComponents({ name: 'UiButton' })).toHaveLength(1)

    const wrapper = mountSheet(existing)
    expect(wrapper.findAllComponents({ name: 'UiButton' })).toHaveLength(2)

    await wrapper.findAll('button').at(-1)!.trigger('click')

    expect(deleteMutate).toHaveBeenCalledWith('tpl-1', expect.anything())
  })
})
