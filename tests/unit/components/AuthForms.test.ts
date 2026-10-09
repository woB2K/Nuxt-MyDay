import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from '../../../app/pages/auth/login.vue'
import RegisterPage from '../../../app/pages/auth/register.vue'

const { store, navigate } = vi.hoisted(() => ({
  store: { register: vi.fn(), login: vi.fn() },
  navigate: vi.fn()
}))

mockNuxtImport('useAuthStore', () => () => store)
mockNuxtImport('navigateTo', () => navigate)
mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

const UiInput = {
  props: ['modelValue', 'error', 'type', 'placeholder'],
  emits: ['update:modelValue'],
  template: '<label :data-field="placeholder"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><span v-if="error" data-error>{{ error }}</span></label>'
}

const stubs = {
  UiInput,
  UiButton: { template: '<button type="submit"><slot /></button>' },
  UIcon: true,
  NuxtLink: { template: '<a><slot /></a>' }
}

function httpError(statusCode: number) {
  return Object.assign(new Error(`HTTP ${statusCode}`), { statusCode })
}

function fieldError(wrapper: ReturnType<typeof mount>, field: string) {
  return wrapper.find(`[data-field="${field}"] [data-error]`)
}

async function fill(wrapper: ReturnType<typeof mount>, values: Record<string, string>) {
  for (const [field, value] of Object.entries(values))
    await wrapper.find(`[data-field="${field}"] input`).setValue(value)
}

async function submit(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

beforeEach(() => {
  store.register.mockReset()
  store.login.mockReset()
  navigate.mockReset()
})

describe('форма регистрации', () => {
  async function mountFilled() {
    const wrapper = mount(RegisterPage, { global: { stubs } })
    await fill(wrapper, { 'auth.name': 'Max', 'auth.email': 'max@test.local', 'auth.password': 'password123' })
    return wrapper
  }

  it('после успешной регистрации уводит на Today', async () => {
    store.register.mockResolvedValueOnce(undefined)
    const wrapper = await mountFilled()

    await submit(wrapper)

    expect(store.register).toHaveBeenCalledWith({ name: 'Max', email: 'max@test.local', password: 'password123' })
    expect(navigate).toHaveBeenCalledWith('/today')
  })

  it('на 409 пишет под полем email, что он уже зарегистрирован', async () => {
    store.register.mockRejectedValueOnce(httpError(409))
    const wrapper = await mountFilled()

    await submit(wrapper)

    expect(fieldError(wrapper, 'auth.email').text()).toBe('auth.errorEmailTaken')
    expect(wrapper.text()).not.toContain('auth.errorGeneric')
    expect(navigate).not.toHaveBeenCalled()
  })

  it('понимает статус и из data ответа', async () => {
    store.register.mockRejectedValueOnce({ data: { statusCode: 409 } })
    const wrapper = await mountFilled()

    await submit(wrapper)

    expect(fieldError(wrapper, 'auth.email').text()).toBe('auth.errorEmailTaken')
  })

  it('на 429 просит подождать', async () => {
    store.register.mockRejectedValueOnce(httpError(429))
    const wrapper = await mountFilled()

    await submit(wrapper)

    expect(wrapper.text()).toContain('auth.errorTooManyAttempts')
    expect(fieldError(wrapper, 'auth.email').exists()).toBe(false)
  })

  it('на прочие ошибки показывает общий текст', async () => {
    store.register.mockRejectedValueOnce(httpError(500))
    const wrapper = await mountFilled()

    await submit(wrapper)

    expect(wrapper.text()).toContain('auth.errorGeneric')
    expect(fieldError(wrapper, 'auth.email').exists()).toBe(false)
  })

  it('при повторной отправке снимает ошибку «email занят»', async () => {
    store.register.mockRejectedValueOnce(httpError(409)).mockResolvedValueOnce(undefined)
    const wrapper = await mountFilled()
    await submit(wrapper)

    await fill(wrapper, { 'auth.email': 'other@test.local' })
    await submit(wrapper)

    expect(fieldError(wrapper, 'auth.email').exists()).toBe(false)
    expect(navigate).toHaveBeenCalledWith('/today')
  })

  it('невалидную форму не отправляет на сервер', async () => {
    const wrapper = mount(RegisterPage, { global: { stubs } })
    await fill(wrapper, { 'auth.name': 'M', 'auth.email': 'bad', 'auth.password': 'short' })

    await submit(wrapper)

    expect(store.register).not.toHaveBeenCalled()
    expect(fieldError(wrapper, 'auth.name').text()).toBe('auth.errorShortName')
    expect(fieldError(wrapper, 'auth.email').text()).toBe('auth.errorInvalidEmail')
    expect(fieldError(wrapper, 'auth.password').text()).toBe('auth.errorShortPassword')
  })
})

describe('форма входа', () => {
  async function mountFilled() {
    const wrapper = mount(LoginPage, { global: { stubs } })
    await fill(wrapper, { 'auth.email': 'max@test.local', 'auth.password': 'password123' })
    return wrapper
  }

  it('после успешного входа уводит на Today', async () => {
    store.login.mockResolvedValueOnce(undefined)
    const wrapper = await mountFilled()

    await submit(wrapper)

    expect(navigate).toHaveBeenCalledWith('/today')
  })

  it.each([
    [401, 'auth.errorInvalidCredentials'],
    [429, 'auth.errorTooManyAttempts'],
    [500, 'auth.errorGeneric']
  ])('на %i показывает %s', async (status, message) => {
    store.login.mockRejectedValueOnce(httpError(status))
    const wrapper = await mountFilled()

    await submit(wrapper)

    expect(wrapper.text()).toContain(message)
    expect(navigate).not.toHaveBeenCalled()
  })
})
