import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import NotificationsPage from '../../../app/pages/settings/notifications.vue'
import { useAuthStore } from '../../../app/stores/auth'

const state = vi.hoisted(() => ({
  availability: 'ready',
  permission: 'default',
  subscribed: false,
  save: vi.fn()
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('usePush', () => () => ({
  availability: ref(state.availability),
  permission: ref(state.permission),
  subscribed: ref(state.subscribed),
  busy: ref(false),
  enable: vi.fn(),
  disable: vi.fn(),
  sendTest: vi.fn()
}))
mockNuxtImport('useReminderDefaults', () => () => ({ enableDefaults: vi.fn() }))
mockNuxtImport('useUpdateSettingsMutation', () => () => ({ mutate: state.save }))

function mountPage(settings: Record<string, unknown> = {}) {
  useAuthStore().user = {
    id: 'u1',
    name: 'Max',
    email: null,
    settings: { remindFinanceAt: null, remindTasksAt: null, ...settings } as never
  }

  return mount(NotificationsPage, {
    global: {
      stubs: {
        UiRoundBtn: true,
        UiCard: { template: '<div><slot /></div>' },
        UiSettingRow: { props: ['label', 'sub'], template: '<div :data-sub="sub"><slot name="trailing" /></div>' },
        UiSwitch: { props: ['modelValue'], emits: ['update:modelValue'], template: '<button type="button" :aria-checked="modelValue" v-bind="$attrs" @click="$emit(\'update:modelValue\', !modelValue)" />' },
        UiButton: { template: '<button type="button" v-bind="$attrs"><slot /></button>' },
        UIcon: true
      }
    }
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  state.availability = 'ready'
  state.permission = 'default'
  state.subscribed = false
  state.save.mockReset()
})

describe('экран уведомлений', () => {
  it('включает напоминание о тратах на 21:00 и показывает время', async () => {
    const wrapper = mountPage()

    await wrapper.find('[data-reminder="finance"]').trigger('click')

    expect(state.save).toHaveBeenCalledWith({ remindFinanceAt: '21:00' })
    expect((wrapper.find('[data-reminder-time="finance"]').element as HTMLInputElement).value).toBe('21:00')
  })

  it('выключает напоминание о задачах', async () => {
    const wrapper = mountPage({ remindTasksAt: '09:00' })

    await wrapper.find('[data-reminder="tasks"]').trigger('click')

    expect(state.save).toHaveBeenCalledWith({ remindTasksAt: null })
    expect(wrapper.find('[data-reminder-time="tasks"]').exists()).toBe(false)
  })

  it('объясняет, почему push недоступен, и блокирует тумблер устройства', () => {
    state.permission = 'denied'
    const wrapper = mountPage()

    expect(wrapper.find('[data-sub="notifications.hint.denied"]').exists()).toBe(true)
    expect(wrapper.find('[data-push-device]').attributes('disabled')).toBeDefined()
  })

  it('кнопка тестового пуша есть только на подписанном устройстве', () => {
    expect(mountPage().find('[data-push-test]').exists()).toBe(false)

    state.subscribed = true
    expect(mountPage().find('[data-push-test]').exists()).toBe(true)
  })
})
