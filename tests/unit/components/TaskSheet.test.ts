import type { TaskItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import TaskSheet from '../../../app/components/features/tasks/TaskSheet.vue'

const { state, addMutate, updateMutate, deleteMutate, tagMutate, toastError } = vi.hoisted(() => ({
  state: {
    tags: { value: [{ id: 'tag-1', name: 'дом' }, { id: 'tag-2', name: 'работа' }] }
  },
  addMutate: vi.fn(),
  updateMutate: vi.fn(),
  deleteMutate: vi.fn(),
  tagMutate: vi.fn(),
  toastError: vi.fn()
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useAppToast', () => () => ({ success: () => {}, error: toastError, info: () => {} }))
mockNuxtImport('useTagsQuery', () => () => ({ data: state.tags }))
mockNuxtImport('useAddTaskMutation', () => () => ({ mutate: addMutate, isPending: ref(false) }))
mockNuxtImport('useUpdateTaskMutation', () => () => ({ mutate: updateMutate, isPending: ref(false) }))
mockNuxtImport('useDeleteTaskMutation', () => () => ({ mutate: deleteMutate, isPending: ref(false) }))
mockNuxtImport('useAddTagMutation', () => () => ({ mutate: tagMutate, isPending: ref(false) }))

const existing: TaskItem = {
  id: 'task-1',
  userId: 'user-1',
  title: 'Сдать отчёт',
  notes: 'до обеда',
  done: false,
  doneAt: null,
  priority: 'HIGH',
  dueDate: new Date('2026-09-20T00:00:00.000Z'),
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

function mountSheet(task: TaskItem | null = null) {
  return mount(TaskSheet, {
    props: { open: true, task },
    global: {
      stubs: {
        UiSheet: { template: '<div><slot /></div>' },
        UiPillSelect: true,
        UiDateStrip: true,
        UiChip: true,
        UiInput: true,
        UiRoundBtn: { name: 'UiRoundBtn', template: '<button type="button"><slot /></button>' },
        UiButton: { template: '<button type="submit"><slot /></button>' },
        UIcon: true
      }
    }
  })
}

function dateField(wrapper: ReturnType<typeof mountSheet>) {
  return wrapper.find('input[type="date"]')
}

beforeEach(() => {
  addMutate.mockReset()
  updateMutate.mockReset()
  deleteMutate.mockReset()
  tagMutate.mockReset()
  toastError.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('taskSheet', () => {
  it('заполняется из задачи при открытии в режиме редактирования', () => {
    const wrapper = mountSheet(existing)

    expect(dateField(wrapper).element.value).toBe('2026-09-20')
    expect(wrapper.findComponent({ name: 'UiPillSelect' }).props('modelValue')).toBe('HIGH')
  })

  it('создаёт задачу без дедлайна, если дата не выбрана', async () => {
    const wrapper = mountSheet()
    await wrapper.findAllComponents({ name: 'UiInput' })[0]!.setValue('Купить молоко')

    await wrapper.find('form').trigger('submit')

    expect(addMutate).toHaveBeenCalledTimes(1)
    expect(addMutate.mock.calls[0]![0]).toEqual({
      title: 'Купить молоко',
      notes: '',
      priority: 'NONE',
      tagIds: []
    })
  })

  it('шлёт календарный день, а не ISO-мгновение', async () => {
    const wrapper = mountSheet()
    await wrapper.findAllComponents({ name: 'UiInput' })[0]!.setValue('Купить молоко')
    await dateField(wrapper).setValue('2026-09-20')

    await wrapper.find('form').trigger('submit')

    expect(addMutate.mock.calls[0]![0].dueDate).toBe('2026-09-20')
  })

  it('очищает дедлайн через null при редактировании', async () => {
    const wrapper = mountSheet(existing)
    await dateField(wrapper).setValue('')

    await wrapper.find('form').trigger('submit')

    expect(updateMutate).toHaveBeenCalledTimes(1)
    expect(updateMutate.mock.calls[0]![0]).toMatchObject({ id: 'task-1', dueDate: null })
  })

  it('не отправляет задачу без названия', async () => {
    const wrapper = mountSheet()

    await wrapper.find('form').trigger('submit')

    expect(addMutate).not.toHaveBeenCalled()
    expect(toastError).toHaveBeenCalledTimes(1)
  })

  it('сохраняет выбранные теги', async () => {
    const wrapper = mountSheet(existing)

    await wrapper.find('form').trigger('submit')

    expect(updateMutate.mock.calls[0]![0]).toMatchObject({ tagIds: ['tag-1'] })
  })

  it('новый тег сразу попадает в выбранные', async () => {
    tagMutate.mockImplementation((_body, options) => options.onSuccess({ id: 'tag-3', name: 'спорт' }))
    const wrapper = mountSheet()
    await wrapper.findAllComponents({ name: 'UiInput' })[0]!.setValue('Купить молоко')
    await wrapper.find('input[type="text"]').setValue('спорт')

    await wrapper.findComponent({ name: 'UiRoundBtn' }).trigger('click')
    await wrapper.find('form').trigger('submit')

    expect(tagMutate.mock.calls[0]![0]).toEqual({ name: 'спорт' })
    expect(addMutate.mock.calls[0]![0]).toMatchObject({ tagIds: ['tag-3'] })
  })

  it('удаляет задачу только в режиме редактирования', async () => {
    expect(mountSheet().findAll('button[type="button"]').length).toBe(1)

    const wrapper = mountSheet(existing)
    const buttons = wrapper.findAll('button[type="button"]')
    await buttons[buttons.length - 1]!.trigger('click')

    expect(deleteMutate).toHaveBeenCalledWith('task-1', expect.anything())
  })
})
