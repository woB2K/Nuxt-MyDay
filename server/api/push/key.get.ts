import type { PushKey } from '~~/shared/types'

export default defineEventHandler((): PushKey => {
  const { vapidPublicKey, vapidPrivateKey, vapidSubject } = useRuntimeConfig()

  return { publicKey: vapidPublicKey && vapidPrivateKey && vapidSubject ? vapidPublicKey : null }
})
