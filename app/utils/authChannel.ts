export const AUTH_CHANNEL = 'myday-auth'
export const SIGNED_OUT = 'signed-out'

export function announceSignOut(): void {
  if (typeof BroadcastChannel === 'undefined') return

  const channel = new BroadcastChannel(AUTH_CHANNEL)
  channel.postMessage(SIGNED_OUT)
  channel.close()
}

export function onSignOutElsewhere(handler: () => void): void {
  if (typeof BroadcastChannel === 'undefined') return

  new BroadcastChannel(AUTH_CHANNEL).addEventListener('message', (event) => {
    if (event.data === SIGNED_OUT) handler()
  })
}
