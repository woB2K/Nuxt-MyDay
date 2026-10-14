import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import PinPage from '../../../app/pages/auth/pin.vue'
import { useUiStore } from '../../../app/stores/ui'

const { verify, reject } = vi.hoisted(() => ({
  verify: { error: undefined as unknown },
  reject: vi.fn()
}))

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) => (params ? `${key}(${JSON.stringify(params)})` : key)
}))
mockNuxtImport('navigateTo', () => vi.fn())
mockNuxtImport('useVerifyPinMutation', () => () => ({
  isPending: ref(false),
  mutate: (_body: unknown, options: { onSuccess: () => void, onError: (cause: unknown) => void }) => {
    if (verify.error) options.onError(verify.error)
    else options.onSuccess()
  }
}))

function mountPage() {
  return mount(PinPage, {
    global: {
      stubs: {
        PinResetSheet: true,
        UiPinScreen: {
          props: ['error'],
          emits: ['submit', 'forgot'],
          setup: () => ({ reject, clear: vi.fn() }),
          template: '<div><p data-error>{{ error }}</p><button data-submit @click="$emit(\'submit\', \'1234\')" /></div>'
        }
      }
    }
  })
}

async function enterPin(wrapper: ReturnType<typeof mountPage>) {
  await wrapper.find('[data-submit]').trigger('click')
  await flushPromises()
}

beforeEach(() => {
  setActivePinia(createPinia())
  useUiStore().isLocked = true
  verify.error = undefined
  reject.mockReset()
})

describe('экран PIN', () => {
  it('без сети пишет, что проверим позже, и не тратит попытку', async () => {
    verify.error = Object.assign(new Error('fetch failed'), { name: 'FetchError' })
    const wrapper = mountPage()

    await enterPin(wrapper)
    expect(wrapper.find('[data-error]').text()).toBe('pin.offline')
    expect(reject).toHaveBeenCalledTimes(1)

    verify.error = Object.assign(new Error('Forbidden'), { statusCode: 403 })
    await enterPin(wrapper)

    expect(wrapper.find('[data-error]').text()).toBe('pin.wrong({"count":9})')
  })

  it('неверный PIN по-прежнему считает попытки', async () => {
    verify.error = Object.assign(new Error('Forbidden'), { statusCode: 403 })
    const wrapper = mountPage()

    await enterPin(wrapper)
    await enterPin(wrapper)

    expect(wrapper.find('[data-error]').text()).toBe('pin.wrong({"count":8})')
  })
})
