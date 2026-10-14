import type { OutboxEntry } from '../../../app/utils/outbox'
import { IDBFactory } from 'fake-indexeddb'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive, ref } from 'vue'
import {
  clearOutbox,
  deliver,
  OUTBOX_SYNC_TAG,
  outboxEntries,
  putOutboxEntry,
  removeOutboxEntry,
  requestBackgroundSync,
  shouldRetry,
  transactionEntry
} from '../../../app/utils/outbox'
import 'fake-indexeddb/auto'

const body = { type: 'EXPENSE' as const, amount: 350, categoryId: 'cat-1', date: '2026-10-14' }

function entry(id: string, userId = 'user-1', createdAt = Date.now()): OutboxEntry {
  return { ...transactionEntry(userId, { ...body, id }), createdAt }
}

const httpError = (statusCode: number) => Object.assign(new Error(`HTTP ${statusCode}`), { statusCode })
const networkDown = () => Object.assign(new Error('fetch failed'), { name: 'FetchError' })

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('transactionEntry', () => {
  it('ключ записи — клиентский id транзакции, адрес — эндпоинт создания', () => {
    const queued = transactionEntry('user-1', { ...body, id: 'a'.repeat(32) })

    expect(queued).toMatchObject({ id: 'a'.repeat(32), userId: 'user-1', url: '/api/finance/transactions', body: { ...body, id: 'a'.repeat(32) } })
    expect(queued.createdAt).toBeTypeOf('number')
  })
})

describe('хранилище в IndexedDB', () => {
  it('отдаёт записи только своего пользователя, старые сначала', async () => {
    await putOutboxEntry(entry('late', 'user-1', 200))
    await putOutboxEntry(entry('early', 'user-1', 100))
    await putOutboxEntry(entry('other', 'user-2', 50))

    const entries = await outboxEntries('user-1')

    expect(entries.map(e => e.id)).toEqual(['early', 'late'])
  })

  it('сохраняет тело из реактивного состояния формы — Proxy в IndexedDB не клонируется', async () => {
    const tagIds = ref(['tag-1'])

    await putOutboxEntry(transactionEntry('user-1', reactive({ ...body, id: 'a'.repeat(32), tagIds: tagIds.value })))

    expect((await outboxEntries('user-1'))[0]?.body.tagIds).toEqual(['tag-1'])
  })

  it('повторная запись того же id не плодит дубль', async () => {
    await putOutboxEntry(entry('same'))
    await putOutboxEntry(entry('same'))

    expect(await outboxEntries('user-1')).toHaveLength(1)
  })

  it('удаляет запись по id', async () => {
    await putOutboxEntry(entry('one'))
    await putOutboxEntry(entry('two'))

    await removeOutboxEntry('one')

    expect((await outboxEntries('user-1')).map(e => e.id)).toEqual(['two'])
  })

  it('clearOutbox стирает записи одного пользователя и не трогает чужие', async () => {
    await putOutboxEntry(entry('mine'))
    await putOutboxEntry(entry('theirs', 'user-2'))

    await clearOutbox('user-1')

    expect(await outboxEntries('user-1')).toEqual([])
    expect(await outboxEntries('user-2')).toHaveLength(1)
  })

  it('без IndexedDB чтение пустое, а запись падает — мутация покажет ошибку', async () => {
    vi.stubGlobal('indexedDB', undefined)

    expect(await outboxEntries('user-1')).toEqual([])
    await expect(clearOutbox('user-1')).resolves.toBeUndefined()
    await expect(putOutboxEntry(entry('one'))).rejects.toThrow('IndexedDB is unavailable')
  })
})

describe('shouldRetry', () => {
  it.each([
    ['обрыв сети', networkDown(), true],
    ['401 — сессию ещё можно восстановить', httpError(401), true],
    ['408', httpError(408), true],
    ['429', httpError(429), true],
    ['500', httpError(500), true],
    ['503', httpError(503), true],
    ['400 — запись невалидна', httpError(400), false],
    ['404', httpError(404), false],
    ['409 — id занят', httpError(409), false]
  ])('%s → %s', (_label, error, expected) => {
    expect(shouldRetry(error)).toBe(expected)
  })
})

describe('deliver', () => {
  it('шлёт по порядку и убирает отправленное', async () => {
    const send = vi.fn().mockResolvedValue({})
    const remove = vi.fn().mockResolvedValue(undefined)
    const entries = [entry('a'), entry('b')]

    const result = await deliver(entries, send, remove)

    expect(send.mock.calls.map(([e]) => e.id)).toEqual(['a', 'b'])
    expect(remove.mock.calls.map(([id]) => id)).toEqual(['a', 'b'])
    expect(result.sent.map(e => e.id)).toEqual(['a', 'b'])
    expect(result.rejected).toEqual([])
  })

  it('на обрыве сети останавливается и оставляет остаток в очереди', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(networkDown())
    const remove = vi.fn().mockResolvedValue(undefined)

    const result = await deliver([entry('a'), entry('b'), entry('c')], send, remove)

    expect(send).toHaveBeenCalledTimes(2)
    expect(remove.mock.calls.map(([id]) => id)).toEqual(['a'])
    expect(result.sent.map(e => e.id)).toEqual(['a'])
  })

  it('на 5xx тоже останавливается — сервер может ожить', async () => {
    const send = vi.fn().mockRejectedValueOnce(httpError(502))
    const remove = vi.fn()

    const result = await deliver([entry('a'), entry('b')], send, remove)

    expect(send).toHaveBeenCalledTimes(1)
    expect(remove).not.toHaveBeenCalled()
    expect(result).toEqual({ sent: [], rejected: [] })
  })

  it('отклонённую сервером запись выбрасывает и идёт дальше', async () => {
    const send = vi.fn()
      .mockRejectedValueOnce(httpError(400))
      .mockResolvedValueOnce({})
    const remove = vi.fn().mockResolvedValue(undefined)

    const result = await deliver([entry('bad'), entry('good')], send, remove)

    expect(remove.mock.calls.map(([id]) => id)).toEqual(['bad', 'good'])
    expect(result.rejected.map(e => e.id)).toEqual(['bad'])
    expect(result.sent.map(e => e.id)).toEqual(['good'])
  })
})

describe('requestBackgroundSync', () => {
  it('регистрирует sync-тег, если браузер умеет Background Sync', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    const getRegistration = vi.fn().mockResolvedValue({ sync: { register } })
    Object.defineProperty(navigator, 'serviceWorker', { value: { getRegistration }, configurable: true })

    try {
      await requestBackgroundSync()

      expect(register).toHaveBeenCalledWith(OUTBOX_SYNC_TAG)
    } finally {
      Reflect.deleteProperty(navigator, 'serviceWorker')
    }
  })

  it('молча ничего не делает без service worker и без SyncManager', async () => {
    Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true })

    try {
      await expect(requestBackgroundSync()).resolves.toBeUndefined()

      Object.defineProperty(navigator, 'serviceWorker', { value: { getRegistration: vi.fn().mockResolvedValue({}) }, configurable: true })
      await expect(requestBackgroundSync()).resolves.toBeUndefined()
    } finally {
      Reflect.deleteProperty(navigator, 'serviceWorker')
    }
  })
})
