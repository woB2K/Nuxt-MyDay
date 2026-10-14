import type { QueryClient } from '@tanstack/vue-query'
import type { OutboxEntry } from '../../../app/utils/outbox'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { IDBFactory } from 'fake-indexeddb'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useOutbox } from '../../../app/composables/useOutbox'
import { useAuthStore } from '../../../app/stores/auth'
import { OUTBOX_SYNC_TAG, outboxEntries, putOutboxEntry, transactionEntry } from '../../../app/utils/outbox'
import 'fake-indexeddb/auto'

const { mockApi, toastSuccess, toastError } = vi.hoisted(() => ({
  mockApi: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn()
}))

mockNuxtImport('useApi', () => () => mockApi)
mockNuxtImport('useAppToast', () => () => ({ success: toastSuccess, error: toastError, info: vi.fn() }))

const profile = {
  id: 'user-1',
  name: 'Max',
  email: 'max@example.com',
  settings: { theme: 'dark', accent: 'violet', lang: 'en', pinEnabled: false }
}

const body = { type: 'EXPENSE' as const, amount: 350, categoryId: 'cat-1', date: '2026-10-14' }

function entry(id: string, userId = 'user-1', createdAt = Date.now()): OutboxEntry {
  return { ...transactionEntry(userId, { ...body, id }), createdAt }
}

const httpError = (statusCode: number) => Object.assign(new Error(`HTTP ${statusCode}`), { statusCode })
const networkDown = () => Object.assign(new Error('fetch failed'), { name: 'FetchError' })

let invalidate: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory())
  setActivePinia(createPinia())
  useAuthStore().user = structuredClone(profile)
  mockApi.mockReset().mockResolvedValue({})
  toastSuccess.mockReset()
  toastError.mockReset()
  invalidate = vi.spyOn(useNuxtApp().$queryClient as QueryClient, 'invalidateQueries')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('useOutbox().flush', () => {
  it('досылает записи пользователя тем же телом и с тем же id', async () => {
    await putOutboxEntry(entry('a'.repeat(32), 'user-1', 1))
    await putOutboxEntry(entry('b'.repeat(32), 'user-1', 2))
    const outbox = useOutbox()

    await outbox.flush()

    expect(mockApi.mock.calls).toEqual([
      ['/api/finance/transactions', { method: 'POST', body: { ...body, id: 'a'.repeat(32) } }],
      ['/api/finance/transactions', { method: 'POST', body: { ...body, id: 'b'.repeat(32) } }]
    ])
    expect(await outboxEntries('user-1')).toEqual([])
    expect(outbox.pending.value).toEqual([])
  })

  it('после отправки обновляет списки и сводку и говорит, сколько ушло', async () => {
    await putOutboxEntry(entry('a'.repeat(32)))
    await putOutboxEntry(entry('b'.repeat(32)))

    await useOutbox().flush()

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['transactions'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['summary'] })
    expect(toastSuccess).toHaveBeenCalledWith('2 offline records synced')
    expect(toastError).not.toHaveBeenCalled()
  })

  it('не трогает записи других аккаунтов на этом устройстве', async () => {
    await putOutboxEntry(entry('a'.repeat(32), 'user-2'))

    await useOutbox().flush()

    expect(mockApi).not.toHaveBeenCalled()
    expect(await outboxEntries('user-2')).toHaveLength(1)
  })

  it('на обрыве сети оставляет записи и молчит', async () => {
    await putOutboxEntry(entry('a'.repeat(32)))
    mockApi.mockRejectedValueOnce(networkDown())
    const outbox = useOutbox()

    await outbox.flush()

    expect(await outboxEntries('user-1')).toHaveLength(1)
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
    expect(invalidate).not.toHaveBeenCalled()
  })

  it('отклонённую сервером запись убирает и показывает тост, который не исчезает сам', async () => {
    await putOutboxEntry(entry('a'.repeat(32)))
    mockApi.mockRejectedValueOnce(httpError(400))

    await useOutbox().flush()

    expect(await outboxEntries('user-1')).toEqual([])
    expect(toastError).toHaveBeenCalledWith('Couldn\'t sync 1 offline record — please add it again', { persistent: true })
  })

  it('без сети даже не пробует', async () => {
    await putOutboxEntry(entry('a'.repeat(32)))
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    await useOutbox().flush()

    expect(mockApi).not.toHaveBeenCalled()
  })

  it('без сессии ничего не шлёт', async () => {
    await putOutboxEntry(entry('a'.repeat(32)))
    useAuthStore().user = null

    await useOutbox().flush()

    expect(mockApi).not.toHaveBeenCalled()
  })

  it('параллельные вызовы делят одну досылку', async () => {
    await putOutboxEntry(entry('a'.repeat(32)))
    const outbox = useOutbox()

    await Promise.all([outbox.flush(), outbox.flush(), useOutbox().flush()])

    expect(mockApi).toHaveBeenCalledTimes(1)
  })
})

describe('useOutbox().enqueue', () => {
  it('сохраняет запись, показывает её в pending и просит Background Sync', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { getRegistration: vi.fn().mockResolvedValue({ sync: { register } }) },
      configurable: true
    })

    try {
      const outbox = useOutbox()

      await outbox.enqueue(entry('a'.repeat(32)))

      expect(await outboxEntries('user-1')).toHaveLength(1)
      expect(outbox.pending.value.map(e => e.id)).toEqual(['a'.repeat(32)])
      await vi.waitFor(() => expect(register).toHaveBeenCalledWith(OUTBOX_SYNC_TAG))
    } finally {
      Reflect.deleteProperty(navigator, 'serviceWorker')
    }
  })
})

describe('useOutbox().load', () => {
  it('показывает только записи текущего пользователя', async () => {
    await putOutboxEntry(entry('a'.repeat(32), 'user-1'))
    await putOutboxEntry(entry('b'.repeat(32), 'user-2'))
    const outbox = useOutbox()

    await outbox.load()
    expect(outbox.pending.value.map(e => e.id)).toEqual(['a'.repeat(32)])

    useAuthStore().user = null
    await outbox.load()
    expect(outbox.pending.value).toEqual([])
  })
})

describe('useOutbox().report', () => {
  it('отчёт service worker обновляет данные и показывает тост', () => {
    useOutbox().report(1)

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['transactions'] })
    expect(toastSuccess).toHaveBeenCalledWith('1 offline record synced')
  })

  it('пустой отчёт ничего не делает', () => {
    useOutbox().report(0)

    expect(invalidate).not.toHaveBeenCalled()
    expect(toastSuccess).not.toHaveBeenCalled()
  })
})
