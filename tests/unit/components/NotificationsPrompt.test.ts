import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import NotificationsPrompt from '../../../app/components/features/settings/NotificationsPrompt.vue'
import { useAuthStore } from '../../../app/stores/auth'
import { useUiStore } from '../../../app/stores/ui'
import { pushPromptStorageKey } from '../../../app/utils/push'

const push = vi.hoisted(() => ({
  availability: { value: 'ready' },
  permission: { value: 'default' },
  subscribed: { value: false },
  enable: vi.fn(),
  enableDefaults: vi.fn(),
  navigate: vi.fn()
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('usePush', () => () => ({
  availability: ref(push.availability.value),
  permission: ref(push.permission.value),
  subscribed: ref(push.subscribed.value),
  ready: ref(true),
  busy: ref(false),
  enable: push.enable
}))
mockNuxtImport('useReminderDefaults', () => () => ({ enableDefaults: push.enableDefaults }))
mockNuxtImport('navigateTo', () => push.navigate)

function signIn() {
  const auth = useAuthStore()
  auth.accessToken = 'token'
  auth.user = { id: 'u1', name: 'Max', email: null, settings: {} as never }
}

function mountPrompt() {
  return mount(NotificationsPrompt, {
    global: {
      stubs: {
        UiSheet: { props: ['open'], emits: ['update:open'], template: '<div v-if="open" data-sheet><slot /></div>' },
        UiButton: { template: '<button type="button" v-bind="$attrs"><slot /></button>' },
        UIcon: true
      }
    }
  })
}

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  push.availability.value = 'ready'
  push.permission.value = 'default'
  push.subscribed.value = false
  push.enable.mockReset()
  push.enableDefaults.mockReset()
  push.navigate.mockReset()
})

describe('окно «Появились уведомления»', () => {
  it('показывается вошедшему пользователю, который ещё не решал про уведомления', () => {
    signIn()

    expect(mountPrompt().find('[data-push-prompt]').exists()).toBe(true)
  })

  it('не показывается, если уже показывали, экран заблокирован или разрешение уже выдано', () => {
    signIn()
    localStorage.setItem(pushPromptStorageKey, '1')
    expect(mountPrompt().find('[data-push-prompt]').exists()).toBe(false)

    localStorage.clear()
    useUiStore().isLocked = true
    expect(mountPrompt().find('[data-push-prompt]').exists()).toBe(false)

    useUiStore().isLocked = false
    push.permission.value = 'granted'
    push.subscribed.value = true
    expect(mountPrompt().find('[data-push-prompt]').exists()).toBe(false)
  })

  it('«Включить» подписывает устройство, ставит время по умолчанию и больше не показывается', async () => {
    signIn()
    push.enable.mockResolvedValue('enabled')
    const wrapper = mountPrompt()

    await wrapper.find('[data-push-enable]').trigger('click')
    await flushPromises()

    expect(push.enable).toHaveBeenCalled()
    expect(push.enableDefaults).toHaveBeenCalled()
    expect(wrapper.find('[data-push-prompt]').exists()).toBe(false)
    expect(localStorage.getItem(pushPromptStorageKey)).toBe('1')
  })

  it('«Позже» закрывает окно без запроса разрешения, «Настроить» ведёт на экран уведомлений', async () => {
    signIn()
    const later = mountPrompt()
    await later.find('[data-push-later]').trigger('click')
    expect(push.enable).not.toHaveBeenCalled()
    expect(later.find('[data-push-prompt]').exists()).toBe(false)

    localStorage.clear()
    const configure = mountPrompt()
    await configure.find('[data-push-configure]').trigger('click')
    expect(push.navigate).toHaveBeenCalledWith('/settings/notifications')
  })

  it('на iPhone в Safari-вкладке не показывается — установку предлагает баннер на Today', () => {
    signIn()
    push.availability.value = 'needsInstall'

    expect(mountPrompt().find('[data-push-prompt]').exists()).toBe(false)
  })
})
