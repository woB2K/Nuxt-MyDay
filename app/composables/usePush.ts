import type { PushKey, PushTestResult } from '~~/shared/types'
import type { PushAvailability, PushEnvironment } from '~/utils/push'
import { isStandalone } from '~/composables/usePwaInstall'
import { pushAvailability, vapidKeyBytes } from '~/utils/push'
import { detectInstallDevice } from '~/utils/pwaInstall'

export type EnableOutcome = 'enabled' | 'denied' | 'unavailable' | 'failed'

type Api = ReturnType<typeof useApi>

const availability = ref<PushAvailability>('unsupported')
const permission = ref<NotificationPermission>('default')
const subscribed = ref(false)
const ready = ref(false)
const busy = ref(false)
const vapidKey = ref('')

function environment(vapidKey: string): PushEnvironment {
  return {
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushManager: 'PushManager' in window,
    hasNotification: 'Notification' in window,
    iosBrowserTab: detectInstallDevice(navigator.userAgent)?.platform === 'ios' && !isStandalone(),
    vapidKey
  }
}

async function registration(): Promise<ServiceWorkerRegistration | undefined> {
  return navigator.serviceWorker.getRegistration()
}

async function currentSubscription(): Promise<PushSubscription | null> {
  return (await registration())?.pushManager.getSubscription() ?? null
}

function register(api: Api, subscription: PushSubscription) {
  return api('/api/push/subscriptions', { method: 'POST', body: subscription.toJSON() })
}

async function fetchVapidKey(api: Api): Promise<string> {
  try {
    return (await api<PushKey>('/api/push/key')).publicKey ?? ''
  } catch {
    return vapidKey.value
  }
}

export async function startPush(api: Api): Promise<void> {
  vapidKey.value = await fetchVapidKey(api)
  availability.value = pushAvailability(environment(vapidKey.value))

  if (availability.value === 'ready') {
    permission.value = Notification.permission

    try {
      const subscription = permission.value === 'granted' ? await currentSubscription() : null

      subscribed.value = subscription !== null

      if (subscription) await register(api, subscription)
    } catch {}
  }

  ready.value = true
}

export async function releasePushDevice(accessToken: string | null): Promise<void> {
  try {
    if (!('serviceWorker' in navigator)) return

    const subscription = await currentSubscription()

    if (!subscription) return

    if (accessToken) {
      await $fetch('/api/push/subscriptions', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { endpoint: subscription.endpoint }
      }).catch(() => {})
    }

    await subscription.unsubscribe()
  } catch {} finally {
    subscribed.value = false
  }
}

export function usePush() {
  const api = useApi()

  async function enable(): Promise<EnableOutcome> {
    if (availability.value !== 'ready') return 'unavailable'

    busy.value = true

    try {
      permission.value = await Notification.requestPermission()

      if (permission.value !== 'granted') return 'denied'

      const target = await registration()

      if (!target) return 'unavailable'

      const subscription = await target.pushManager.getSubscription()
        ?? await target.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKeyBytes(vapidKey.value) })

      await register(api, subscription)
      subscribed.value = true

      return 'enabled'
    } catch {
      return 'failed'
    } finally {
      busy.value = false
    }
  }

  async function disable(): Promise<boolean> {
    busy.value = true

    try {
      const subscription = await currentSubscription()

      if (subscription) {
        await api('/api/push/subscriptions', { method: 'DELETE', body: { endpoint: subscription.endpoint } })
        await subscription.unsubscribe()
      }

      subscribed.value = false

      return true
    } catch {
      return false
    } finally {
      busy.value = false
    }
  }

  function sendTest() {
    return api<PushTestResult>('/api/push/test', { method: 'POST' })
  }

  return {
    availability: readonly(availability),
    permission: readonly(permission),
    subscribed: readonly(subscribed),
    ready: readonly(ready),
    busy: readonly(busy),
    enable,
    disable,
    sendTest
  }
}
