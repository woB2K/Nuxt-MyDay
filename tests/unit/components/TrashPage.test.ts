import type { TrashResponse } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import TrashPage from '../../../app/pages/settings/trash.vue'

const { state, mocks } = vi.hoisted(() => ({
  state: { trash: undefined as unknown, pending: false, categories: [] as unknown[] },
  mocks: {
    restoreTask: vi.fn(),
    restoreTransaction: vi.fn(),
    restoreSavings: vi.fn(),
    deleteForever: vi.fn(),
    emptyTrash: vi.fn()
  }
}))

const dictionary: Record<string, string> = {
  'categories.food': 'Еда',
  'finance.savings.deposit': 'Пополнение',
  'settings.trashScreen.tasks': 'Задачи',
  'settings.trashScreen.transactions': 'Транзакции',
  'settings.trashScreen.savings': 'Накопления'
}

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) =>
    dictionary[key] ?? (params ? `${key}(${JSON.stringify(params)})` : key)
}))
mockNuxtImport('useTrashQuery', () => () => ({ data: ref(state.trash), isPending: ref(state.pending) }))
mockNuxtImport('useCategoriesQuery', () => () => ({ data: ref(state.categories) }))
mockNuxtImport('useRestoreTaskMutation', () => () => ({ mutate: mocks.restoreTask }))
mockNuxtImport('useRestoreTransactionMutation', () => () => ({ mutate: mocks.restoreTransaction }))
mockNuxtImport('useRestoreSavingsMutation', () => () => ({ mutate: mocks.restoreSavings }))
mockNuxtImport('useDeleteForeverMutation', () => () => ({ mutate: mocks.deleteForever }))
mockNuxtImport('useEmptyTrashMutation', () => () => ({ mutate: mocks.emptyTrash, isPending: ref(false) }))

const deletedAt = new Date().toISOString()

function fullTrash(): TrashResponse {
  return {
    tasks: [{ id: 't-1', title: 'Отчёт', deletedAt, tags: [] }],
    transactions: [{ id: 'tx-1', type: 'EXPENSE', amount: 250, notes: null, categoryId: 'cat-food', deletedAt }],
    savings: [{ id: 's-1', type: 'DEPOSIT', amount: 1000, notes: null, deletedAt }]
  } as unknown as TrashResponse
}

function mountPage(trash: TrashResponse | undefined, pending = false) {
  state.trash = trash
  state.pending = pending
  state.categories = [{ id: 'cat-food', key: 'food', name: 'Food', icon: 'i-lucide-utensils', color: '#FB923C' }]

  return mount(TrashPage, {
    global: {
      stubs: {
        UIcon: true,
        UiRoundBtn: true,
        UiButton: { template: '<button data-cancel @click="$emit(\'click\')"><slot /></button>' },
        UiCard: { template: '<div><slot /></div>' },
        UiSkeletonRow: { template: '<div data-skeleton />' },
        UiSectionHeader: { props: ['title', 'caption'], template: '<h2>{{ title }} {{ caption }}</h2>' },
        UiEmptyState: { props: ['title'], template: '<div data-empty>{{ title }}</div>' },
        UiSheet: { props: ['open'], template: '<div v-if="open" data-sheet><slot /></div>' },
        UiSwipeRow: {
          props: ['rightAction'],
          emits: ['complete', 'delete'],
          template: '<div data-row :data-restore-label="rightAction?.label"><button data-restore @click="$emit(\'complete\')" /><button data-forever @click="$emit(\'delete\')" /><slot /></div>'
        }
      }
    }
  })
}

beforeEach(() => {
  Object.values(mocks).forEach(mock => mock.mockReset())
})

describe('страница корзины', () => {
  it('показывает секции задач, транзакций и накоплений по порядку', () => {
    const sections = mountPage(fullTrash()).findAll('[data-section]').map(el => el.attributes('data-section'))

    expect(sections).toEqual(['tasks', 'transactions', 'savings'])
  })

  it('пустые секции не рисует', () => {
    const wrapper = mountPage({ ...fullTrash(), transactions: [], savings: [] })

    expect(wrapper.findAll('[data-section]').map(el => el.attributes('data-section'))).toEqual(['tasks'])
  })

  it('в заголовке секции — число объектов', () => {
    expect(mountPage(fullTrash()).find('[data-section="tasks"] h2').text()).toBe('Задачи 1')
  })

  it('задача показывает название и сколько дней ей осталось', () => {
    const text = mountPage(fullTrash()).find('[data-section="tasks"]').text()

    expect(text).toContain('Отчёт')
    expect(text).toContain('settings.trashScreen.daysLeft({"count":30})')
  })

  it('транзакция без заметки подписана категорией и показывает сумму со знаком', () => {
    const text = mountPage(fullTrash()).find('[data-section="transactions"]').text()

    expect(text).toContain('Еда')
    expect(text).toMatch(/-250\s₽/)
  })

  it('транзакция с удалённой категорией всё равно показывается', () => {
    const trash = fullTrash()
    trash.transactions[0]!.categoryId = 'gone'
    trash.transactions[0]!.notes = 'Такси'

    const text = mountPage(trash).find('[data-section="transactions"]').text()

    expect(text).toContain('Такси')
  })

  it('запись копилки подписана своим типом и суммой', () => {
    const text = mountPage(fullTrash()).find('[data-section="savings"]').text()

    expect(text).toContain('Пополнение')
    expect(text).toMatch(/\+1\s000\s₽/)
  })

  it('свайп вправо подписан «Восстановить»', () => {
    expect(mountPage(fullTrash()).find('[data-row]').attributes('data-restore-label')).toBe('settings.trashScreen.restore')
  })

  it('свайп вправо восстанавливает объект своим запросом', async () => {
    const wrapper = mountPage(fullTrash())

    await wrapper.find('[data-section="tasks"] [data-restore]').trigger('click')
    await wrapper.find('[data-section="transactions"] [data-restore]').trigger('click')
    await wrapper.find('[data-section="savings"] [data-restore]').trigger('click')

    expect(mocks.restoreTask).toHaveBeenCalledWith('t-1')
    expect(mocks.restoreTransaction).toHaveBeenCalledWith('tx-1')
    expect(mocks.restoreSavings).toHaveBeenCalledWith('s-1')
  })

  it('свайп влево удаляет навсегда с указанием вида', async () => {
    const wrapper = mountPage(fullTrash())

    await wrapper.find('[data-section="tasks"] [data-forever]').trigger('click')
    await wrapper.find('[data-section="transactions"] [data-forever]').trigger('click')
    await wrapper.find('[data-section="savings"] [data-forever]').trigger('click')

    expect(mocks.deleteForever.mock.calls).toEqual([
      [{ kind: 'task', id: 't-1' }],
      [{ kind: 'transaction', id: 'tx-1' }],
      [{ kind: 'savings', id: 's-1' }]
    ])
  })

  it('«Очистить корзину» сначала спрашивает подтверждение', async () => {
    const wrapper = mountPage(fullTrash())

    expect(wrapper.find('[data-sheet]').exists()).toBe(false)
    await wrapper.findAll('button').find(el => el.text() === 'settings.trashScreen.empty')!.trigger('click')

    expect(wrapper.find('[data-sheet]').text()).toContain('settings.trashScreen.confirmText({"count":3})')
    expect(mocks.emptyTrash).not.toHaveBeenCalled()
  })

  it('подтверждение очищает корзину', async () => {
    const wrapper = mountPage(fullTrash())
    await wrapper.findAll('button').find(el => el.text() === 'settings.trashScreen.empty')!.trigger('click')

    await wrapper.find('[data-confirm]').trigger('click')

    expect(mocks.emptyTrash).toHaveBeenCalledOnce()
  })

  it('после очистки шит подтверждения закрывается', async () => {
    mocks.emptyTrash.mockImplementation((_vars, options) => options.onSettled())
    const wrapper = mountPage(fullTrash())
    await wrapper.findAll('button').find(el => el.text() === 'settings.trashScreen.empty')!.trigger('click')

    await wrapper.find('[data-confirm]').trigger('click')

    expect(wrapper.find('[data-sheet]').exists()).toBe(false)
  })

  it('«Отмена» закрывает шит и ничего не удаляет', async () => {
    const wrapper = mountPage(fullTrash())
    await wrapper.findAll('button').find(el => el.text() === 'settings.trashScreen.empty')!.trigger('click')

    await wrapper.find('[data-cancel]').trigger('click')

    expect(wrapper.find('[data-sheet]').exists()).toBe(false)
    expect(mocks.emptyTrash).not.toHaveBeenCalled()
  })

  it('пустая корзина: пустое состояние без подсказки и без кнопки очистки', () => {
    const wrapper = mountPage({ tasks: [], transactions: [], savings: [] })

    expect(wrapper.find('[data-empty]').text()).toBe('settings.trashScreen.emptyTitle')
    expect(wrapper.text()).not.toContain('settings.trashScreen.hint')
    expect(wrapper.findAll('button').some(el => el.text() === 'settings.trashScreen.empty')).toBe(false)
  })

  it('пока корзина грузится — скелетоны, а не пустое состояние', () => {
    const wrapper = mountPage(undefined, true)

    expect(wrapper.findAll('[data-skeleton]').length).toBeGreaterThan(0)
    expect(wrapper.find('[data-empty]').exists()).toBe(false)
  })
})
